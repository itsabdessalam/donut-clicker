const express = require("express");
const router = express.Router();

//passport
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

//user model
const User = require("../models/user");

//signup
router.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Inscription - Donut Clicker",
    pageClass: 'signup'
  });
});
//login
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Connexion - Donut Clicker",
    pageClass: 'login'
  });
});

// router.get("/profile", (req, res) => {   res.render("profile", {     title:
// "Mon profil - Donut Clicker",     pageClass: 'profile'   }); }); when signup
// post
router.post("/signup", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password_c = req.body.password_c;

  req
    .checkBody("username", "Username is required")
    .notEmpty();
  req
    .checkBody("email", "Email is required")
    .notEmpty();
  req
    .checkBody("email", "Email is not valid")
    .isEmail();
  req
    .checkBody("password", "Password is required")
    .notEmpty();
  req
    .checkBody("password_c", "Passwords do not match")
    .equals(req.body.password);
  const errors = req.validationErrors();

  if (errors) {
    res.render("signup", {errors: errors});
  } else {
    const newUser = new User({username, email, password});

    User.createUser(newUser, (err, user) => {
      if (err) 
        throw err;
      console.log(user);
    });
    res.redirect("/users/login");
  }
});
//use passport strategy and redefine, by default login is with username
passport.use("local", new LocalStrategy({
  usernameField: "email",
  passwordField: "password"
}, (email, password, done) => {
  User.getUserByEmail(email, (err, user) => {
    if (err) 
      throw err;
    if (!user) {
      return done(null, false, {message: "User not found"});
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) 
        throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {message: "Incorrect password"});
      }
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

//when login post

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/users/login",
  failureFlash: true
}), (req, res) => {
  res.redirect("/");
});

//when logout passport allows to logout with .logout()
router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/users/login");
});
module.exports = router;