function isNotAuth(req, res, next) {
  if (!Boolean(req.session?.user)) {
    next();
    return;
  }
  res.redirect('back');
}

module.exports = isNotAuth