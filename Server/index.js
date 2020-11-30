const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const oanda = require("./oanda/oanda");
const MongoStore = require("connect-mongo")(session);
const User = require("./models/user");

const port = 3001;

const LocalStrategy = require("passport-local").Strategy;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

app.use(passport.initialize());
//app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    User.authenticate()
  )
);
//passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "secret",
    },
    function (jwtPayload, done) {
      return User.findById(jwtPayload.id)
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

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

oanda.run();

const cors = require("cors");
app.use(cors());

require("./routes")(app);

app.listen(port, () => {
  console.log("Hello: " + port);
});

console.log();
