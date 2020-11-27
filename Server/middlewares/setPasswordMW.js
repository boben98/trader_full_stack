module.exports = (objRepo) => {
  const User = objRepo.User;
  function fillWithData(req, res) {
    if (typeof res.locals.forgotten === "undefined") {
      if (typeof req.body.name !== "undefined")
        res.locals.user.name = req.body.name;
      if (typeof req.body.email !== "undefined") {
        res.locals.user.username = req.body.email;
        res.locals.user.email = req.body.email;
      }
      if (typeof req.body.phone !== "undefined")
        res.locals.user.phone = req.body.phone;
    }
  }
  return (req, res, next) => {
    let username, password;
    if (typeof res.locals.forgotten !== "undefined") {
      username = res.locals.forgotten.username;
      password = res.locals.forgotten.newPassword;
    } else {
      if (typeof req.user === "undefined")
        return res.status(400).json({ message: "User parameter missing" });
      username = req.user.username;
      password = req.body.password;
    }

    User.findOne({ username: username }, (err, user1) => {
      if (err)
        return res.status(500).json({ message: "Setting password failed" });
      //console.log(user1);
      if (password !== "") {
        user1.setPassword(password, (err, user2) => {
          if (err)
            return res.status(500).json({ message: "Setting password failed" });
          //console.log(user2)

          user2.save((err, user3) => {
            if (err) return console.log(err);
            //console.log(user3)
            if (typeof res.locals.forgotten !== "undefined") return;
            res.locals.user = user3;
            fillWithData(req, res);
            return next();
          });
        });
      } else {
        res.locals.user = user1;
        fillWithData(req, res);
        return next();
      }
    });
  };
};
