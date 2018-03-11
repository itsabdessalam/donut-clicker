const express = require('express');
const router = express.Router();

const axios = require('axios');
const User = require("../models/user");

/* GET home page. */
router.get('/', ensureAuthenticated, (req, res) => {
  //console.log("Browser session");
  //console.log(req.session);
  res.render('index', {
    title: 'Donut Clicker',
    user: req.user
  });
});

router.get('/backup', (req, res) => {

  if ('id' in req.query) {
    console.log('Retrieve Backup...');
    User.getUserById(req.query.id, (err, user) => {
      if (err) throw err;

      res.send({
        backup: user.backup
      });
      console.log('Backup loaded');
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
  console.log('Saving...');
  //console.log('Game info are :');
  //console.log(JSON.stringify(req.body));
  //console.log(req.user);
  if ('id' in req.body) {
    User.getUserById(req.body.id, (err, user) => {
      if (err) throw err;

      user.backup = req.body.backup;

      user.save(function (err) {
        if (err) throw err;
        console.log('Game Saved !');
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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}
module.exports = router;