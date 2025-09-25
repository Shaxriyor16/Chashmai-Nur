const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
