const Router = require('express');
const passport = require('passport');

const isAuth = require('../middlewares/auth/is.auth.middleware');
const isNotAuth = require('../middlewares/auth/is.not.auth.middleware');
const UsersController = require('../controllers/users.controller');

const router = Router();

router.get('/login', isNotAuth, UsersController.showLoginPage);
router.get('/signup', UsersController.showSignupPage);
router.get('/profile', isAuth, UsersController.showProfilePage);

router.post('/login', isNotAuth, passport.authenticate('local-login', {
    failureRedirect: '/login',
}), UsersController.loginHandler);

router.post('/signup', isNotAuth, passport.authenticate('local-signup', {
    failureRedirect: '/signup',
}), UsersController.loginHandler);

router.get('/github', passport.authenticate('github', {
    failureRedirect: '/signup',
}), (req, res) => {});

router.get('/githubSessions',
    passport.authenticate('github', {
        failureRedirect: '/login',
        failureMessage: true
    }),
    UsersController.loginHandler
);

router.get('/logout', isAuth, UsersController.logoutHandler);

router.get('/github/fail', UsersController.getGithubFail);

module.exports = router;