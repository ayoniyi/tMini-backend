const router = require('express').Router()
const Tweet = require('../models/Tweet')
const User = require('../models/User')
const Notifications = require('../models/Notifications')
const verify = require('./verifyToken')

// create a tweet
router.post('/', verify, async (req, res) => {
  const tweet = new Tweet(req.body)
  try {
    const newTweet = await tweet.save()
    res.status(200).json(newTweet)
  } catch (err) {
    res.status(500).json(err)
  }
})

//create a tweet reply

// router.put('/reply/:id', async (req, res) => {
//   try {
//     const tweet = await Tweet.findById(req.params.id)
//     const replyTweet =
//     await tweet.updateOne({ $push: { replies: req.body.userId } })
//     res.status(200).json(tweet)
//   } catch (err) {
//     res.status(500).json(err)
//   }
// })

router.post('/reply/:id', async (req, res) => {
  const tweet = new Tweet(req.body)
  try {
    const newTweet = await tweet.save()
    const oldTweet = await Tweet.findById(req.params.id)
    const otherUser = await User.findById(oldTweet.userId)
    const tempalerts = otherUser.tempAlerts
    const currentUser = await User.findById(req.body.userId)
    await oldTweet.updateOne({
      $push: {
        replies: {
          _id: newTweet._id,
          userId: req.body.userId,
          desc: req.body.desc,
          img: req.body.img,
          likes: [],
          retweets: [],
          replies: [],
        },
      },
    })
    const alert = new Notifications({
      userImg: currentUser.profilePicture,
      username: currentUser.username,
      headline: currentUser.name + ' replied to your tweet.',
      description: oldTweet.desc,
    })
    await otherUser.updateOne({
      $push: { notifications: alert },
      $set: { tempAlerts: tempalerts + 1 },
    })
    res.status(200).json(newTweet)
  } catch (err) {
    res.status(500).json(err)
    console.log(err)
  }
})

//update a tweet
// router.put('/:id', async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id)
//     if (post.userId === req.body.userId) {
//       await post.updateOne({ $set: req.body })
//       res.status(200).json('Post updated successfully')
//     } else {
//       res.status(403).json('You can only update your post!')
//     }
//   } catch (err) {
//     res.status(404).json(err)
//   }
// })

//delete a tweet
router.delete('/:id', verify, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    // const replyTweet = await Tweet.find({
    //   replies: { _id: req.params.id },
    // })
    const replyTweet = await Tweet.find({
      reply: { id: ' ' + req.params.id },
    })
    // if (tweet.userId === req.body.userId) {
    //   await tweet.deleteOne({ $set: req.body })
    //   res.status(200).json('Tweet deleted successfully')
    // } else {
    //   res.status(403).json('You can only delete your tweet!')
    // }
    await tweet.deleteOne({ $set: req.body }) ///////
    await replyTweet[0].updateOne({ $pull: { replies: { _id: tweet._id } } })

    //console.log('  >>>', replyTweet[0].replies.reverse())

    res.status(200).json('Tweet deleted successfully')
  } catch (err) {
    console.log(err)
    res.status(404).json(err)
  }
})

// like/dislike a tweet
router.put('/:id/like', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    const currentUser = await User.findById(req.body.likerId)
    const otherUser = await User.findById(req.body.ownerId)
    const tempalerts = otherUser.tempAlerts
    if (!tweet.likes.includes(req.body.likerId)) {
      if (tweet.userId !== req.body.likerId) {
        await tweet.updateOne({ $push: { likes: req.body.likerId } })
        const alert = new Notifications({
          userImg: currentUser.profilePicture,
          username: currentUser.username,
          headline: currentUser.name + ' liked your tweet.',
          description: tweet.desc,
        })
        await otherUser.updateOne({
          $push: { notifications: alert },
          $set: { tempAlerts: tempalerts + 1 },
        })
        res.status(200).json('Tweet was liked!')
      } else {
        res.status(403).json("You can't like your own tweet on twitterMini")
      }
    } else {
      // alternate method to unfollow
      await tweet.updateOne({ $pull: { likes: req.body.likerId } })
      res.status(200).json('The tweet was disliked')
    }
  } catch (err) {
    res.status(500).json(err)
    console.log(err)
  }
})

//retweet a tweet
router.put('/:id/retweet', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    const currentUser = await User.findById(req.body.retweeterId)
    const otherUser = await User.findById(req.body.ownerId)
    const tempalerts = otherUser.tempAlerts
    if (!tweet.retweets.includes(req.body.retweeterId)) {
      if (tweet.userId !== req.body.retweeterId) {
        await tweet.updateOne({ $push: { retweets: req.body.retweeterId } })
        await otherUser.updateOne({
          $push: {
            notifications: {
              userImg: currentUser.profilePicture,
              username: currentUser.username,
              headline: currentUser.name + ' retweeted your tweet.',
              description: tweet.desc,
            },
          },
          $set: { tempAlerts: tempalerts + 1 },
        })
        res.status(200).json('Tweet was retweeted!')
      } else {
        res.status(403).json("You can't retweet your own tweet on twitterMini")
      }
    } else {
      await tweet.updateOne({ $pull: { retweets: req.body.retweeterId } })
      res.status(200).json('The retweet was undone')
    }
  } catch (err) {
    res.status(500).json(err)
    console.log(err)
  }
})

//get a tweet
router.get('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    res.status(200).json(tweet)
  } catch (err) {
    res.status(500).json(err)
  }
})

//get all replies to a tweet
router.get('/replies/:tweetId', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    console.log(tweet)
    res.status(200).json(tweet.replies)
    //res.status(200).json(replies)
  } catch (err) {
    res.status(500).json(err)
    console.log(err)
  }
})

//get all tweets for timeline
router.get('/tm/:userId', verify, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId)
    const userTweets = await Tweet.find({ userId: currentUser._id })
    const friendsTweets = await Promise.all(
      currentUser.following.map((friendId) => {
        return Tweet.find({ userId: friendId })
      }),
    )
    const friendsRetweets = await Promise.all(
      currentUser.following.map((friendId) => {
        return Tweet.find({ retweets: friendId })
      }),
    )
    res
      .status(200)
      .json(userTweets.concat(...friendsTweets, ...friendsRetweets))
  } catch (err) {
    res.status(500).json(err)
  }
})

//get all user's tweets
router.get('/tweets/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    const tweets = await Tweet.find({ userId: user._id })
    res.status(200).json(tweets)
  } catch (err) {
    res.status(500).json(err)
  }
})

//get all user's retweets
router.get('/retweets/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    const tweets = await Tweet.find({
      retweets: '' + user._id,
    })
    res.status(200).json(tweets)
  } catch (err) {
    res.status(500).json(err)
  }
})

//get all user's likes
router.get('/likes/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    const tweets = await Tweet.find({
      likes: '' + user._id,
    })
    res.status(200).json(tweets)
  } catch (err) {
    res.status(500).json(err)
  }
})

//get all user's media
router.get('/media/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    const tweets = await Tweet.find({
      userId: user._id,
      img: { $exists: true, $gte: ' ' },
    })
    res.status(200).json(tweets)
  } catch (err) {
    res.status(500).json(err)
  }
})

module.exports = router
