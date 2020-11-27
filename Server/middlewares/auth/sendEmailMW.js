const sendmail = require("sendmail")();

module.exports = function () {
  function generateTemporaryPassword(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  return function (req, res, next) {
    if (
      typeof req.body.name !== "undefined" &&
      typeof req.body.phone !== "undefined" &&
      typeof req.body.message !== "undefined" &&
      typeof req.body.email !== "undefined"
    ) {
      let name = "Name: " + req.body.name;
      let phone = "Phone: " + req.body.phone;
      let messageSplit = req.body.message.split("\n");
      let message = "<br/>" + messageSplit.join("<br/>");
      sendmail(
        {
          from: req.body.email,
          to: "boben98@gmail.com",
          subject: "Forex robot contact form",
          html: [name, phone, message].join("<br/>"),
        },
        function (err, reply) {
          if (err) console.log(err);
        }
      );

      return next();
    } else if (typeof req.body.email !== "undefined") {
      let password = generateTemporaryPassword(5);
      sendmail(
        {
          from: "no-reply@forexrobot.com",
          to: req.body.email,
          subject: "New password",
          html: "Your new password: " + password,
        },
        function (err, reply) {
          console.log(err && err.stack);
          console.dir(reply);
        }
      );
      const forgotten = {
        username: req.body.email,
        newPassword: password,
      };
      res.locals.forgotten = forgotten;
      return next();
    } else return next();
  };
};
