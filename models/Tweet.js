const mongoose = require('mongoose')

const TweetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    retweets: {
      type: Array,
      default: [],
    },
    replies: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Tweets', TweetSchema)
