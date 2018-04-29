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
router.get('/backup', (req, res) => {

  if ('id' in req.query) {
    console.log(req.query.id + ' : Retrieve Backup...');
    User.getUserById(req.query.id, (err, user) => {
      if (err) 
        throw err;
      
      res.send({backup: user.backup});
      console.log(req.query.id + ' : Backup loaded');
    });
  } else {
    console.log('Undefined user');
    console.log('No Backup');
    res.send({backup: null});
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
        res.send({saved: true});
      });
    });
  } else {
    console.log('Undefined user');
    res.send({saved: false});
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
  User.getUserByEmail(req.body.email, (err, user) => {
    if (!err && user) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          user.password = hash;
          user.save(function (err) {
            if (err)
              throw err;
            console.log(req.body.email + ' : Reset done !');
            res.send({ reset: true });
          });
        });
      });
    } else {
      res.send("User not found");
    }
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}
module.exports = router;