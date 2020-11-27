module.exports = (objRepo) => {
  const User = objRepo.UserModel;
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    if (
      typeof req.body.name === "undefined" ||
      typeof req.body.email === "undefined" ||
      typeof req.body.phone === "undefined" ||
      typeof req.body.oanda_api_key === "undefined" ||
      typeof req.body.password === "undefined"
    ) {
      return res.status(400).json({ message: "User parameters missing" });
    }

    let user = new User();

    user.name = req.body.name;
    user.username = req.body.email;
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.oanda_api_key = req.body.oanda_api_key;

    User.register(user, req.body.password, (err, user) => {
      if (err) {
        return res.status(500).json({ message: "User registration failed" });
      }

      user.save((err) => {
        if (err) {
          return res.status(500).json({ message: "User registration failed" });
        }
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "User login failed" });
        }
      });

      res.json({ message: "User registration succesful" });
    });
  };
};
