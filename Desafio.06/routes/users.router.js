const Router = require('express');
const passport = require('passport');

const isAuth = require('../middlewares/auth/is.auth.middleware');
const isNotAuth = require('../middlewares/auth/is.not.auth.middleware');
const userManager = require('../dao/db/user.manager');
const cartManager = require('../dao/db/cart.manager');
const { hashPassword, isValidPassword } = require('../utils/password.encrypter.utils');

// const { createProductValidatorMiddleware } = require('../middlewares/ProductValidator.middleware');

const router = Router();

router.get('/login', isNotAuth, (req, res) => {
    res.render('users/login');
});
router.get('/signup', (req, res) => {
    res.render('users/signup');
});
router.get('/profile', isAuth, (req, res) => {
    res.render('users/profile', {
        user: req.user,
        cid: req.user?.cart?._id,
        ...req.user
    });
});

const loginHandler = (req, res) => {
    //  i don't set it in the `options` object, because i need to set the cookie
    res.cookie('user', req.user.first_name).redirect('/profile');
};

router.post('/login', isNotAuth, passport.authenticate('local-login', {
    failureRedirect: '/login',
}), loginHandler);

router.post('/signup', isNotAuth, passport.authenticate('local-signup', {
    failureRedirect: '/signup',
}), loginHandler);

router.get('/github', passport.authenticate('github', {
    failureRedirect: '/signup',
}), (req, res) => {});

router.get('/githubSessions',
    passport.authenticate('github', { failureRedirect: '/github/fail' }),
    loginHandler
);

router.get('/logout', isAuth, (req, res) => {
    req.logOut((err) => {
        if (err) {
            res.redirect('/back');
        } else {
            res.redirect('/login');
        }
    });
});

router.get('/github/fail', (req, res) => {
    res.send('There has been an error. Try again later');
});

module.exports = router;