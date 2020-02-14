const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  // Available from 6 AM to 8 aM
  a6to8: {
    type: Boolean,
    required: true,
    default: false
  },
  // Available from 8 AM to 12 ...
  a8to12: {
    type: Boolean,
    required: true,
    default: false
  },
  a12to14: {
    type: Boolean,
    required: true,
    default: false
  },
  a14to18: {
    type: Boolean,
    required: true,
    default: false
  },
  a18to22: {
    type: Boolean,
    required: true,
    default: false
  }
});

const Availability = mongoose.model('Availability', AvailabilitySchema);

module.exports = Availability;
