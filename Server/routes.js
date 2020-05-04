const db = require("./config/db");
const User = require("./models/user");
const Account = require("./models/account");
const passport = require("passport");

let user = new User();

/*user.name = "Józsi";
user.email = "jozsi@jozsi.jozsi";
user.username = "jozsi@jozsi.jozsi";
user.phone = 36707070707;
user.oanda_api_key =
  "70af9ed822af837a698d8ebd2c5e4e51-d822a044a57f89238dbfeabaddce0f17";

User.register(user, "password", (err, a) => {
  if (err) {
    console.log(err);
  }

  user.save((err) => {
    if (err) {
      console.log(err);
    }
  });
});*/

module.exports = function (app) {
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

  app.use("/user/settings/advanced", (req, res) => {
    res.send("Hello world");
  });

  app.use("/user/settings", (req, res) => {
    res.send("Hello world");
  });

  app.get("/user", (req, res) => {
    res.send("Hello world");
  });
};
