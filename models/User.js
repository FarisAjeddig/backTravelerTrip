const mongoose = require('mongoose');
const Availability = require('./Availability');
const Interest = require('./Interest');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  fbToken: {
    type: String,
    required: false
  },
  picture: {
    type: String,
    required: false
  },
  availability: {
    type: String,
    required: true
  },
  interests: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
