const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  userImg: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    default: '',
  },
  headline: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
})

module.exports = mongoose.model('Notifications', NotificationSchema)
