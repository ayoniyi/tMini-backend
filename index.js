const express = require('express')
const app = express()
const mongoose = require('mongoose')
//const dotenv = require("dotenv");
const helmet = require('helmet')
const morgan = require('morgan')
//const jwt = require('jsonwebtoken');
const cors = require('cors')
const multer = require('multer')
const path = require('path')

//dotenv.config(); // deprecated ?
require('dotenv/config')

// import Routes
const usersRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/tweets')

// Connect DB
mongoose.connect(
  `${process.env.DB_CONNECTION}`,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  () => console.log('Connected to DB'),
)

// Middlewares
app.use(cors())
app.use(express.json()) // alternative to body-parser
app.use(helmet())
app.use(morgan('common'))

// Check route
app.get('/check', (req, res) => {
  res.send('The API IS UP AND RUNNING ')
})

// **** multer upload block ****
//
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads')
  },
  filename: (req, file, cb) => {
    console.log('req body', req.body)
    cb(null, file.originalname)
  },
})

// upload
const upload = multer({ storage })
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    return res.status(200).json('File uploaded')
  } catch (err) {
    console.log(err)
  }
})

// Use Routes
app.use('/api/user', usersRoute)
app.use('/api/auth', authRoute)
app.use('/api/post', postRoute)

// Listen
app.listen(8800, () => {
  console.log('App is listening on 8800')
})
