function isAuth(req, res, next) {
  //  i could use passport's `req.isAuthenticated()`, but i need to see how to manage the session in that case
  //  because with the classic login i'm still storing the user and cart in the session.
  //  On the other side, if i use the same place than passport (req.user), i need to see how/where to store the cart
  if (req.session?.user) {
    next();
    return;
  }

  res.redirect('/login');
}

module.exports = isAuth;