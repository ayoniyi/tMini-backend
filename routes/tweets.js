const router = require('express').Router()
const Tweet = require('../models/Tweet')
const User = require('../models/User')
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
router.delete('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    if (tweet.userId === req.body.userId) {
      await tweet.deleteOne({ $set: req.body })
      res.status(200).json('Tweet deleted successfully')
    } else {
      res.status(403).json('You can only delete your tweet!')
    }
  } catch (err) {
    res.status(404).json(err)
  }
})

// like/dislike a tweet
router.put('/:id/like', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    if (!tweet.likes.includes(req.body.userId)) {
      await tweet.updateOne({ $push: { likes: req.body.userId } })
      res.status(200).json('Tweet was liked!')
    } else {
      // alternate method to unfollow
      await tweet.updateOne({ $pull: { likes: req.body.userId } })
      res.status(200).json('The tweet was disliked')
    }
  } catch (err) {
    res.status(500).json(err)
  }
})

//retweet a tweet
router.put('/:id/retweet', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    if (!tweet.retweets.includes(req.body.userId)) {
      await tweet.updateOne({ $push: { retweets: req.body.userId } })
      res.status(200).json('Tweet was retweeted!')
    } else {
      await tweet.updateOne({ $pull: { retweets: req.body.userId } })
      res.status(200).json('The retweet was undone')
    }
  } catch (err) {
    res.status(500).json(err)
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

//get all tweets for timeline
router.get('/tm/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId)
    const userTweets = await Tweet.find({ userId: currentUser._id })
    const userRetweets = Tweet.find({ retweets: currentUser._id })
    const friendsTweets = await Promise.all(
      currentUser.following.map((friendId) => {
        return Tweet.find({ userId: friendId })
      }),
    )
    res.status(200).json(userTweets.concat(...friendsTweets))
    res.json(userRetweets)
  } catch (err) {
    res.status(500).json(err)
    //console.log(err)
  }
})

//get all user's tweets
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    const tweets = await Tweet.find({ userId: user._id })
    res.status(200).json(tweets)
  } catch (err) {
    res.status(500).json(err)
  }
})

module.exports = router
