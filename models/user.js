const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
//by this passport library- implements the username and password for us with hashing and salting
userSchema.plugin(passportLocalMongoose, {
  usernameUnique: true,
});

module.exports = mongoose.model("User", userSchema);
