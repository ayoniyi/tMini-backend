const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Signup
router.post('/signup', async (req, res) => {
  // check if user exists
  const emailExist = await User.findOne({ email: req.body.email })
  if (emailExist) return res.status(400).send('Email already exists')
  // hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  // user object
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    isAdmin: req.body.isAdmin,
  })
  // save user
  try {
    const newUser = await user.save()
    res.json(newUser)
    //res.status(200)
  } catch (err) {
    res.json({ messages: err, description: err.data })
  }
})

//Login
router.post('/login', async (req, res) => {
  try {
    //Check if email exists
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send('Incorrect username/password')
    //Check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Wrong password.')

    //create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    res.header('auth-token', token)
    const userObj = {
      user,
      token,
    }
    res.status(200).json(userObj)
  } catch (err) {
    console.log(err)
    res.json({ messages: err, description: err.data })
  }
})

module.exports = router
