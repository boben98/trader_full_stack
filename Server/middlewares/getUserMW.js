module.exports = (objRepo) => {
  const User = objRepo.UserModel;
  return (req, res) => {
    User.findOne().exec((err, result) => {
      if (err) return console.log(err);
      console.log(result);
      res.json(result);
    });
  };
};
