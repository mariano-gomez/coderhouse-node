const UserDTO = require('../dao/dto/user.dto');

class UsersController {

    static showLoginPage = (req, res) => {
        const errorMessages = req.session.messages;
        delete req.session.messages;
        res.render('users/login', {
            errors: errorMessages
        });
    };

    static showSignupPage = (req, res) => {
        res.render('users/signup');
    };

    static showProfilePage = (req, res) => {
        res.render('users/profile', {
            user: UserDTO.parse(req.user),
            cid: req.user?.cart?._id,
            ...req.user
        });
    };

    static logoutHandler = (req, res) => {
        req.logOut((err) => {
            if (err) {
                res.redirect('/back');
            } else {
                res.redirect('/login');
            }
        });
    };

    static getGithubFail = (req, res) => {
        res.send('There has been an error. Try again later');
    };

    static loginHandler = (req, res) => {
        //  I don't set it in the `options` object, because I need to set the cookie
        res.cookie('user', req.user.first_name).redirect('/profile');
    };
}

module.exports = UsersController;