const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  category: String,
  image: String,
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Food', FoodSchema);
