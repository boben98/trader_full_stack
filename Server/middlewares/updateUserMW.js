module.exports = (objRepo) => {
  const User = objRepo.UserModel;
  const Algo = objRepo.AlgoModel;
  const Account = objRepo.AccountModel;
  return (req, res, next) => {
    let update = {};
    if (req.body.name) {
      update.name = req.body.name;
    }
    if (req.body.phone) {
      update.phone = req.body.phone;
    }
    if (req.body.oanda_api_key) {
      update.oanda_api_key = req.body.oanda_api_key;
    }
    if (update) {
      User.findByIdAndUpdate(req.user._id, update, (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "User update failed", error: err });
        if (req.body.password) {
          result.setPassword(req.body.password, (err2, result2) => {
            if (err2)
              return res
                .status(500)
                .json({ message: "Updating password failed", error: err2 });
            result2.save((err3, result3) => {
              if (err3)
                return res
                  .status(500)
                  .json({ message: "Saving user failed", error: err3 });
            });
          });
        }
        if (req.body.accountId) {
          Account.findByIdAndUpdate(
            req.user._account._id,
            { accountId: req.body.accountId },
            (err, result) => {
              if (err)
                return res
                  .status(500)
                  .json({ message: "Account update failed", error: err });
            }
          );
        }
        return res.json(result);
      });
    }

    /*let fields;
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

    req.login(res.locals.user, (err) => {
      if (err) return res.status(500).json({ message: "User login failed" });
    });*/
  };
};
