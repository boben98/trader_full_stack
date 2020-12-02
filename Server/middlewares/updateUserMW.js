module.exports = (objRepo) => {
  const User = objRepo.User;
  return (req, res) => {
    let fields;
    if (
      typeof res.locals.user.salt === "undefined" &&
      typeof res.locals.user.hash === "undefined"
    ) {
      fields = {
        username: res.locals.user.email,
        name: res.locals.user.name,
        email: res.locals.user.email,
        phone: res.locals.user.phone,
        oanda_api_key: res.locals.user.oanda_api_key,
      };
    } else {
      fields = {
        username: res.locals.user.email,
        name: res.locals.user.name,
        email: res.locals.user.email,
        phone: res.locals.user.phone,
        oanda_api_key: res.locals.user.oanda_api_key,
        salt: res.locals.user.salt,
        hash: res.locals.user.hash,
      };
    }

    res.locals.user = User.findOneAndUpdate(
      { username: req.user.username },
      fields,
      {
        useFindAndModify: false,
        new: true,
      },
      (err, res) => {
        if (err)
          return res
            .status(500)
            .json({ message: "User update failed", error: err });
        if (res) return res.json({ message: "User update successful" });
        return res.status(500).json({ message: "User update failed" });
      }
    );

    /*req.login(res.locals.user, (err) => {
      if (err) return res.status(500).json({ message: "User login failed" });
    });*/
  };
};
