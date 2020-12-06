module.exports = () => {
  return (req, res) => {
    return res.json(req.user);
  };
};
