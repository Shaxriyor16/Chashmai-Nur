import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String
});

export default mongoose.model("Food", foodSchema);
