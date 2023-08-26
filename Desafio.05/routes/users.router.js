const Router = require('express');
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

router.post('/login', isNotAuth, async (req, res) => {
    //  Authentication comes in the next step, we only check the user
    const { email, password } = req.body;

    try {
        const user = await userManager.getByEmail(email);
        const role = (email == 'adminCoder@coder.com' && password == 'adminCod3r123') ? 'admin' : 'usuario';
        if (!user || !isValidPassword(password, user.password)) {
            throw new Error(`El usuario no existe, o la contraseña es incorrecta`);
        }

        req.session.user = {
            name: user.firstname,
            id: user._id,
            role,
            ...user
        };

        req.session.cart = await cartManager.getByUser(user._id);

        // setear la cookie de usuario
        //  si por alguna razon no se guarda lo q tenemos mas arriba, tenemos q usar el sgte `save()` (cuando usamos FileStore)
        req.session.save((err) => {
            if (!err) {
                res
                    .cookie('user', req.session.user.firstname)
                    .redirect('/')
            } else {
                throw new Error(err);
            }
        });

    } catch (e) {
        res.render('users/login', {
            error: e.message
        });
    }
});

router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/signup', async (req, res) => {
    const user = req.body;

    //  crear al usuario
    try {

        const existing = await userManager.getByEmail(user.email);

        if (existing) {
            res.render('users/signup', {
                error: 'El email ya existe'
            });
            return;
        }

        user.password = hashPassword(user.password);
        const newUser = await userManager.create(user);

        const role = (user.email == 'adminCoder@coder.com' && user.password == 'adminCod3r123') ? 'admin' : 'usuario';

        req.session.user = {
            name: newUser.firstname,
            id: newUser._id,
            role,
            ...newUser._doc
        };

        const newCart = await cartManager.create(newUser._id);
        req.session.cart = await cartManager.getById(newCart._id);

        req.session.save((err) => {
            res.redirect('/');
        });
    } catch (e) {
        return res.render('users/signup', {
            error: 'Ocurrio un error. Intentalo mas tarde'
        })
    }
});

router.get('/profile', isAuth, (req, res) => {
    res.render('users/profile', {
        user: req.session?.user,
        cid: req.session?.cart._id,
        ...req.session?.user
    });
});

router.get('/logout', isAuth, (req, res) => {

    const { user } = req.cookies;

    const userData = req.session.user;

    req.session.destroy((err) => {
        if(err) {
            return res.redirect('back');
        }

        res
            .clearCookie('user')
            .redirect('/login');
        //  I leave this, in case we desire to use a customized login good bye page
        // res.render('users/logout', {
        //     user: {
        //         name: userData.firstname
        //     }
        // });
    });
});

module.exports = router;