module.exports = () => {
  return (req, res) => {
    return res.json(res.locals.user.algo);
  };
};
