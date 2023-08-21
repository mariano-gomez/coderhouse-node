function isNotAuth(req, res, next) {
  if (!req.session?.user) {
    next();
  }
  res.redirect('back');
}

module.exports = isNotAuth