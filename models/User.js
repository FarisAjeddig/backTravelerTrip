const mongoose = require('mongoose');
var mongooseTypePhone = require('mongoose-type-phone');

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
  phoneNumber: {
    type: mongoose.SchemaTypes.Phone,
    required: false
  },
  enterprise: {
    type: String,
    requred: false
  },
  position: { // Poste dans son entreprise
    type: String,
    required: false
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
  },
  firstlaunch: {
    type: Boolean,
    required: true,
    default: true
  },
  lastLong: {
    type: String,
    default: "0"
  },
  lastLat: {
    type: String,
    default: "0"
  },
  lastLocationTime: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
