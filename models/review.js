const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewScema = new Schema({
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewScema);
