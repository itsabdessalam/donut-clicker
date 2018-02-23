/*jshint esversion: 6*/
const mongoose = require("mongoose");

var exports = (module.exports = {});

// create scheme and turn into model
exports.user = mongoose.model("User", {
  username: { type: String, required: true, index: { unique: true } },
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  donuts: { type: Number, default: 0 },
  "donuts/s": { type: Number, default: 0 }
});
