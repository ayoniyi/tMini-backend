const User = require('../models/User')
const Notifications = require('../models/Notifications')
const router = require('express').Router()

//update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
      } catch (err) {
        return res.status(500).json(err)
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      })
      res.status(200).json('Account has been updated.')
      //res.json(user)
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    return res.status(403).json("Cannot Update another user's account!")
  }
})

//get a user
// using params
// router.get('/:id', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id)
//     // send other values apart from password and updatedAt
//     const { password, updatedAt, ...other } = user._doc
//     res.status(200).json(other)
//   } catch (err) {
//     res.status(500).json(err)
//     //res.json({ message: err })
//   }
// })

//get a user
//using query
router.get('/', async (req, res) => {
  const userId = req.query.userId
  const username = req.query.username
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username })
    // send other values apart from password and updatedAt
    const { password, updatedAt, ...other } = user._doc
    res.status(200).json(other)
  } catch (err) {
    res.status(500).json(err)
    //res.json({ message: err })
  }
})

// get a user by username
router.get('/:username', async (req, res) => {
  const username = req.params.username
  try {
    const nameFormat = new RegExp(username)
    const user = await User.find({
      username: { $regex: nameFormat },
    })
    // send other values apart from password and updatedAt
    //const { password, updatedAt, ...other } = user._doc
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json(err)
    console.log(err)
    //res.json({ message: err })
  }
})

//get user followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    const friends = await Promise.all(
      user.followers.map((friendId) => {
        return User.findById(friendId)
      }),
    )
    let friendList = []
    friends.map((friend) => {
      const { _id, username, profilePicture, bio } = friend
      friendList.push({ _id, username, profilePicture, bio })
    })
    res.status(200).json(friendList)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

//get user notifications
router.get('/notifications/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    let notifications = user.notifications
    user.tempAlerts = 0
    user.save()
    res.status(200).json(notifications)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

//get user temporary alerts
router.get('/notifications/temp/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    res.status(200).json(user.tempAlerts)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

//clear user notifications
// router.get('/notifications/clear/:userId', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId)
//     user.notifications = []
//     user.save()
//     res.status(200).json(user.notifications)
//   } catch (err) {
//     console.log(err)
//     res.status(500).json(err)
//   }
// })

//follow user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      const tempalerts = user.tempAlerts
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } })
        await currentUser.updateOne({ $push: { following: req.params.id } })
        const alert = new Notifications({
          userImg: currentUser.profilePicture,
          username: currentUser.username,
          headline: currentUser.name + ' followed you',
        })
        await user.updateOne({
          $push: { notifications: alert },
          $set: { tempAlerts: tempalerts + 1 },
        })
        res.status(200).json('User has been followed')
      } else {
        res.status(403).json('You already follow this user')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json('Cannot follow yourself!')
  }
})

//unfollow user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } })
        await currentUser.updateOne({ $pull: { following: req.params.id } })
        res.status(200).json('User has been unfollowed')
      } else {
        res.status(403).json(`You don't follow this user`)
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json('Cannot unfollow yourself!')
  }
})

//delete user
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
      //const user = await User.remove({ _id: req.params.id }) // alternatively...
      res.status(200).json('Account has been deleted.')
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(403).json("Cannot Delete another user's account!")
  }
})

module.exports = router
