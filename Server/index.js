const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");

const port = process.env.PORT || 3000;

const LocalStrategy = require("passport-local").Strategy;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.use((err, req, res, next) => {
  console.log(err);
});

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

const User = require("./models/user");

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Load routing
require("./routes")(app);

app.listen(port, () => {
  console.log("Hello: " + port);
});

console.log();
