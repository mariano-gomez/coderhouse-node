function isNotAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
    return;
  }
  res.redirect('back');
}

module.exports = isNotAuth