const passport = require("passport");

module.exports = () => {
  return async (req, res, next) => {
    let localUser;
    await passport.authenticate(
      "jwt",
      { session: false },
      async (err, user) => {
        if (err)
          return res
            .status(500)
            .json({ message: "User not found", error: err });
        if (user) {
          localUser = user;
        } else
          return res.status(500).json({ message: "Authentication failed" });
      }
    );
    while (!localUser) {
      await sleep(200);
    }
    res.locals.user = localUser;
    return next();
  };
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
