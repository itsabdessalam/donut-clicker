/*jshint esversion: 6*/
const mongoose = require("mongoose");
//bcrypt for passwords
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// const exports = (module.exports = {});

// create schemea and turn into model

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: {
      unique: true
    }
  },
  email: {
    type: String,
    index: {
      unique: true
    }
  },
  password: {
    type: String
  },
  backup: {
    type: String
  }
});

const User = (module.exports = mongoose.model("User", UserSchema));

module.exports.getAllUsers = callback => {
  User.find({}, callback);
};

module.exports.createUser = (newUser, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = (username, callback) => {
  const query = {
    username
  };
  User.findOne(query, callback);
};

module.exports.getUserByEmail = (email, callback) => {
  const query = {
    email
  };
  User.findOne(query, callback);
};

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback);
};

module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};
