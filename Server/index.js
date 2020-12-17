const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const oanda = require("./config/oanda");
const User = require("./models/user");

const port = 3001;

const cors = require("cors");
app.use(cors());

const LocalStrategy = require("passport-local").Strategy;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

app.use(passport.initialize());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    User.authenticate()
  )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "awrt2",
    },
    function (jwtPayload, done) {
      return User.findById(jwtPayload.id)
        .populate("_account")
        .populate("_algo")
        .then((user) => {
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

app.use((err, req, res, next) => {
  console.log(err);
});

oanda.run();

require("./routes")(app);

app.listen(port, () => {
  console.log("Hello: " + port);
});

console.log();
