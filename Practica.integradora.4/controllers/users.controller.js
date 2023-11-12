const UserDTO = require('../dao/dto/user.dto');
const factory = require('../dao/factory.dao');
const mailSenderService = require("../services/mail.sender.service");
const MailRenderService = require("../services/mail.render.service");
const CustomError = require("../utils/custom.error.utils");
const { hashPassword, isValidPassword } = require("../utils/password.encrypter.utils");

const userManager = factory.getInstance('user');

class UsersController {

    static ONE_HOUR = 3600000;  //  3600000 = 60 * 60 * 1000 = 1 hour

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
        const userData = req.user;
        req.logOut(async (err) => {
            if (err) {
                res.redirect('/back');
            } else {
                await userManager.save(userData._id, {
                    last_connection: Date.now()
                });
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

    //  [GET] /forgot-password
    static showForgottenPasswordPage = (req, res) => {
        const errorMessages = req.session.messages;
        delete req.session.messages;
        res.render('users/forgottenPassword', {
            errors: errorMessages
        });
    }

    //  [POST] /forgot-password
    static postForgottenPasswordPage = async (req, res, next) => {
        const { email } = req.body;

        //  If the mail field is not filled
        if (!email) {
            req.session.messages = req.session.messages || [];
            req.session.messages.push(`Debe ingresar un email`);
            return res.redirect('/forgot-password');
        }

        const user = await userManager.getByEmail(email);
        if (user) {
            const rightNow = Date.now();
            try {
                await userManager.save(user._id, {
                    forgotPasswordRequestDate: `${user._id}-${rightNow}`
                });
            } catch (e) {
                return next(e);
            }

            const html = MailRenderService.renderRestorePassword(`${user._id}-${rightNow}`);
            await mailSenderService.send(user.email, html, 'Actualizar contraseña');
        }

        //  If the user doesn't exist, I should show the same message, to avoid reverse engineering
        res.render('users/forgottenPasswordMailSent', {
            email
        });
    }

    //  [GET] /new-password
    static newPasswordPage = async (req, res, next) => {
        const { id } = req.query;
        const [userId, userTimestamp] = id.split('-');
        const errorMessages = req.session.messages;
        delete req.session.messages;

        const user = await userManager.getById(userId);

        if (user) {
            const rightNow = Date.now();

            if (rightNow - userTimestamp > UsersController.ONE_HOUR) {
                req.session.messages = req.session.messages || [];
                req.session.messages.push(`El enlace caducó. Podés generar un nuevo enlace desde ésta página`);
                return res.redirect('/forgot-password');
            }

            //  If the user doesn't exist, I should show the same message, to avoid reverse engineering
            return res.render('users/changePassword', {
                email: user.email,
                timestamp: userTimestamp,
                errors: errorMessages
            });
        }

        //  If the user doesn't exist, I should show the same form, to avoid reverse engineering
        return res.render('users/changePassword', {
            email: null,
            timestamp: null,
            errors: errorMessages
        });
    }

    //  [POST] /new-password
    static postNewPasswordPage = async (req, res, next) => {
        const { email, timestamp, password, password2 } = req.body;
        req.session.messages = req.session.messages || [];

        //  If i can't find a user, or the timestamp is not on the request, then something critical happened,
        //  recommend to create a new link
        const user = await userManager.getByEmail(email);
        if (!user || !timestamp) {
            req.session.messages.push(`Ha sucedido un error. Por las dudas, generá un nuevo enlace`);
            return res.redirect('/forgot-password');
        }

        if (!password || !password2) {
            req.session.messages.push(`Debe ingresar una nueva contraseña`);
            return res.redirect(`/new-password?id=${user._id}-${timestamp}`);
        }

        if (password !== password2) {
            req.session.messages.push(`Las contraseñas no coinciden`);
            return res.redirect(`/new-password?id=${user._id}-${timestamp}`);
        }

        if(isValidPassword(password, user.password)) {
            req.session.messages.push(`La nueva contraseña debe ser distinta a la actual`);
            return res.redirect(`/new-password?id=${user._id}-${timestamp}`);
        }

        if (password !== password2) {
            req.session.messages.push(`Las contraseñas no coinciden`);
            return res.redirect(`/new-password?id=${user._id}-${timestamp}`);
        }

        //  If it comes to this place, then everything is ok to change the password
        const result = await userManager.save(user._id, {
            forgotPasswordRequestDate: null,
            password: hashPassword(password)
        });

        //  If the user doesn't exist, I should show the same form, to avoid reverse engineering
        return res.render('users/changePasswordCompleted');

    }
}

module.exports = UsersController;