const express = require('express')
const app = express()
const mongoose = require('mongoose')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
// const multer = require('multer')
// const path = require('path')
// **
const aws = require('aws-sdk')
const crypto = require('crypto')
const util = require('util')
// **

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

// Generate randombytes
const randomBytes = util.promisify(crypto.randomBytes)

// AWS S3 Code
const region = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
})

//***** */ S3 UPLOAD BLOCK /*******/
async function generateUploadURL() {
  const rawBytes = await randomBytes(16)
  const imageName = rawBytes.toString('hex')
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60,
  }
  const uploadURL = await s3.getSignedUrlPromise('putObject', params)
  //console.log(uploadURL)
  return uploadURL
}
//***** */ S3 UPLOAD BLOCK /*******/

// Use Routes
app.use('/api/user', usersRoute)
app.use('/api/auth', authRoute)
app.use('/api/post', postRoute)

// Generate s3 URL
app.get('/api/s3url', async (req, res) => {
  const gurl = await generateUploadURL()
  res.send({ gurl })
})

// Listen
app.listen(8800, () => {
  console.log('App is listening on 8800')
})
