module.exports = (objRepo) => {
  const Algo = objRepo.AlgoModel;
  return (req, res) => {
    Algo.findOneAndUpdate(
      { _id: req.user._algo },
      req.body,
      {
        useFindAndModify: false,
        new: true,
      },
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Algo update failed", error: err });
        if (result) return res.json({ message: "Algo update successful" });
        return res.status(500).json({ message: "Algo update failed" });
      }
    );

    /*req.login(res.locals.user, (err) => {
      if (err) return res.status(500).json({ message: "User login failed" });
    });*/
  };
};
