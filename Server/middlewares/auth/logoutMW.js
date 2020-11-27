module.exports = () => {
  return (req, res, next) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "User logout failed" });
    });
    res.json({ message: "User logout succesful" });
  };
};
