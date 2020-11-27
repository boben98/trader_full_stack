const passport = require("passport");

module.exports = () => {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();

    passport.authenticate("local", (err, user, info) => {
      if (err) return res.status(500).json({ message: "User login failed" });

      return res.json({ message: "User login succesful" });
    })(req, res);
  };
};
