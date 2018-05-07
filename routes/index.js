const express = require('express');
const bcrypt = require("bcrypt");
const router = express.Router();

const axios = require('axios');
const User = require("../models/user");

/* GET home page. */
router.get('/', ensureAuthenticated, (req, res) => {
  //console.log("Browser session"); console.log(req.session);
  res.render('index', {
    title: 'Donut Clicker',
    user: req.user
  });
});

router.post('/', (req, res) => {
  const id = req.body.id;
  const username = req.body.username;
  const email = req.body.email;
  let password_test = null;

  User.findById(req.body.id, function (err, user) {
    if (err)
      throw err;
    if (user.username !== username || user.email !== email || req.body.password.length !== 0) {
      if (user.username !== username) {
        req
          .checkBody("username", "Username is required")
          .notEmpty();
        req
          .checkBody("username", "Username Already Exist")
          .isUniqueUsername();
      }
      if (user.email !== email) {
        req
          .checkBody("email", "Email is required")
          .notEmpty();
        req
          .checkBody("email", "Email is not valid")
          .isEmail();
        req
          .checkBody("email", "Email already exist")
          .isUniqueEmail();
      }
      const result = req.getValidationResult().then(err => {
        const errors = err.array();
        console.log(errors);
        if (!err.isEmpty()) {
          res.render("index", {
            errors: errors
          });
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
              user.username = username;
              user.email = email;
              if (req.body.password.length !== 0) {
                user.password = hash;
              }
              user
                .save(function (err) {
                  if (err)
                    throw err;
                  console.log("user saved");
                  res.redirect(req.originalUrl);
                });
            });
          });
        }
      });
    }
  });
});
router.get('/backup', (req, res) => {

  if ('id' in req.query) {
    console.log(req.query.id + ' : Retrieve Backup...');
    User.getUserById(req.query.id, (err, user) => {
      if (err)
        throw err;

      res.send({
        backup: user.backup
      });
      console.log(req.query.id + ' : Backup loaded');
    });
  } else {
    console.log('Undefined user');
    console.log('No Backup');
    res.send({
      backup: null
    });
  }
});

router.put('/save', (req, res) => {
  if ('id' in req.body) {
    console.log(req.body.id + ' : Saving...');
    // console.log('Game info are :'); console.log(JSON.stringify(req.body));
    // console.log(req.user);
    User.getUserById(req.body.id, (err, user) => {
      if (err)
        throw err;

      user.backup = req.body.backup;

      user.save(function (err) {
        if (err)
          throw err;
        console.log(req.body.id + ' : Game Saved !');
        res.send({
          saved: true
        });
      });
    });
  } else {
    console.log('Undefined user');
    res.send({
      saved: false
    });
  }
});
router.get('/forgot_password', (req, res) => {
  res.render('forgot', {
    title: 'Forgot password - Donut Clicker',
    pageClass: 'forgot'
  });
});

router.post('/forgot_password', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const password_c = req.body.password_c;
  if (email.length > 0 && password.length > 0 && password_c.length > 0 && password === password_c) {
    User.getUserByEmail(req.body.email, (err, user) => {
      if (!err && user) {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            user.password = hash;
            user.save(function (err) {
              if (err)
                throw err;
              console.log(req.body.email + ' : Reset done !');
            });
          });
        });
      }
    });
    res.redirect('/users/login');
  } else {
    res.redirect('/forgot_password');
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}
module.exports = router;