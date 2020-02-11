const mongoose = require('mongoose');


const AvailabilitySchema = new mongoose.Schema({
  // Available from 6 AM to 8 aM
  a6to8: {
    type: Boolean,
    default: false
  },
  // Available from 8 AM to 12 ...
  a8to12: {
    type: Boolean,
    default: false
  },
  a12to14: {
    type: Boolean,
    default: false// const Availability = mongoose.model('Availability', AvailabilitySchema);
  },
  a14to18: {
    type: Boolean,
    default: false
  },
  a18to22: {
    type: Boolean,
    default: false
  }
});

// const Availability = mongoose.model('Availability', AvailabilitySchema);

const InterestSchema = new mongoose.Schema({
  // Business
  business: {
    type: Boolean,
    default: false
  },
  // Restaurants
  restaurant: {
    type: Boolean,
    default: false
  },
  // Sports
  sport: {
    type: Boolean,
    default: false
  },
  // Tourisme
  tourism: {
    type: Boolean,
    default: false
  },
  // Autopartage
  carsharing: {
    type: Boolean,
    default: false
  }
});

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
    type: AvailabilitySchema,
    required: true,
    default: AvailabilitySchema
  },
  interests: {
    type: InterestSchema,
    required: true,
    default: InterestSchema
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
