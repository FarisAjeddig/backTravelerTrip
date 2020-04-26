const mongoose = require('mongoose');

const InterestSchema = new mongoose.Schema({
  // Business
  business: {
    type: Boolean,
    required: true,
    default: false
  },
  // Restaurants
  restaurant: {
    type: Boolean,
    required: true,
    default: false
  },
  // Sports
  sport: {
    type: Boolean,
    required: true,
    default: false
  },
  // Tourisme
  tourism: {
    type: Boolean,
    required: true,
    default: false
  },
  // Autopartage
  carsharing: {
    type: Boolean,
    required: true,
    default: false
  },
  // Shopping
  shopping: {
    type: Boolean,
    required: true,
    default: false
  },
  // Spectacle
  spectacle: {
    type: Boolean,
    required: true,
    default: false
  }
});


const Interest = mongoose.model('Interest', InterestSchema);

module.exports = Interest;
