/*jshint esversion: 6*/
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const sassMiddleware = require("node-sass-middleware");
const flash = require("connect-flash");

const expressValidator = require("express-validator");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");

const index = require("./routes/index");
const users = require("./routes/users");
const socket = require("./routes/socket");

const app = express();

const usermodel = require("./models/user");
// db connection
mongoose.connect(
  "mongodb://SuperDonut:tunodrepus@ds247078.mlab.com:47078/donutdb",
  // Use only in dev if you have mongodb
  //"mongodb://localhost/appLogin",
  err => {
    if (err) {
      throw err;
    }
  }
);

// getAllUsers
app.get("/User", (req, res) =>
  usermodel.getAllUsers((err, user) => res.json(user))
);

// // create collection
// app.put("/User", (req, res) =>
//   new usermodel.user({
//     username: "Bob",
//     email: "bob.sponge@test.com",
//     password: "test"
//   }).save(err => {
//     if (err) {
//       res.send(err);
//     } else {
//       res.send("success");
//     }
//   })
// );

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// favicon
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());

//node-sass-middleware
app.use(
  sassMiddleware({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    indentedSyntax: false,
    sourceMap: true
  })
);
app.use(express.static(path.join(__dirname, "public")));

//express-session
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

//init passport
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(
  expressValidator({
    errorFormatter(param, msg, value) {
      const namespace = param.split(".");
      const root = namespace.shift();
      let formParam = root;
      while (namespace.length) {
        formParam += `[${namespace.shift()}]`;
      }
      return {
        param: formParam,
        msg,
        value
      };
    }
  })
);

// use flash
app.use(flash());
// Declare global vars
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

app.use("/", index);
app.use("/users", users);
app.use("/socket", socket);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
module.exports = app;
