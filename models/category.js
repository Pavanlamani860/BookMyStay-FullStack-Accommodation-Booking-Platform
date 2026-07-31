const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true, // "Villa", "Resort"
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true, // "villa", "resort"
    lowercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Category", categorySchema);
