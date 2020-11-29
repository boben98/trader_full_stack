const passport = require("passport");
const jwt = require("jsonwebtoken");

module.exports = () => {
  return (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err)
        return res
          .status(400)
          .json({ message: "User login failed", error: err });
      if (!user) return res.json({ message: info });
      req.login(user, { session: false }, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "User login failed", error: err });
        }
        const token = jwt.sign({ id: user.id, email: user.username }, "secret");
        return res.json({
          message: "Login successful",
          token: token,
          user: user,
        });
      });
    })(req, res);
  };
};
