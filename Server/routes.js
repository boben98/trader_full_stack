const db = require("./config/db");
const User = require("./models/user");
const passport = require("passport");

module.exports = function(app) {
  app.get("/", (req, res) => {
    res.send("Hello world");
  });

  app.get("/login/authenticate", passport.authenticate("local"));

  app.get("/login/forgotten", (req, res) => {
    res.send("Hello world");
  });

  app.get("/login", (req, res) => {
    res.send("Hello world");
  });

  app.post("/register/save", (req, res) => {
    res.send("Hello world");
  });

  app.get("/register", (req, res) => {
    res.send("Hello world");
  });

  app.get("/logout", (req, res) => {
    res.send("Hello world");
  });

  app.get("/user/account", (req, res) => {
    res.send("Hello world");
  });

  app.get("/user/statistics", (req, res) => {
    res.send("Hello world");
  });

  app.use("/user/settings", (req, res) => {
    res.send("Hello world");
  });

  app.get("/user", (req, res) => {
    res.send("Hello world");
  });
};
