const local = require('passport-local');

const { hashPassword, isValidPassword } = require('../utils/password.encrypter.utils');
const factory = require("../dao/factory.dao");
const dependencyContainer = require("../dependency.injection");
const logger = dependencyContainer.get('logger');
const cartManager = factory.getInstance('cart');
const userManager = factory.getInstance('user');

const LocalStrategy = local.Strategy;

const signupStrategyCallback = async (req, email, password, done) => {
    const { email: _email, password: _password, password2: _password2, ...user } = req.body;

    const _user = await userManager.getByEmail(email);

    if (_user) {
        logger.info('passport local strategy (signup): user already exists');
        return done(null, false);
    }


    //  since these variables will be used within several try/catch blocks, i need to declare them outside and, therefore, as let, not as const
    let newUser, cart;

    try {
        newUser = await userManager.create({
            ...user,
            email,
            forgotPasswordRequestDate: null,
            password: hashPassword(password)
        });

    } catch(e) {
        logger.error('passport local strategy (signup): something went wrong [A]');
        done(e, false);
    }

    try {
        //  The user is going to need a cart
        cart = await cartManager.create(newUser._id);
    } catch(e) {
        logger.error('passport local strategy (signup): something went wrong [B]');
        //  if there is a problem creating the cart, the user should be removed
        await userManager.delete(newUser._id);
        done(e, false);
    }

    try {
        await userManager.save(newUser._id, {
            cart,
            ...newUser
        });

        const storedUser = await userManager.getById(newUser._id);

        return done(null, storedUser);

    } catch(e) {
        //  if there is a problem linking the user and the cart, we need to remove both from the DB
        await userManager.delete(newUser._id);
        await cartManager.delete(cart._id);
        logger.error('passport local strategy (signup): something went wrong [C]');
        done(e, false);
    }
}

const loginStrategyCallback = async (email, password, done) => {
    try {
        const _user = await userManager.getByEmail(email);

        if (!_user) {
            logger.info('passport local strategy (login): user not found');
            return done(null, false);
        }

        if (!password) {
            return done(null, false);
        }

        if(!isValidPassword(password, _user.password)) {
            logger.http('passport local strategy (login): credentials mismatch');
            return done(null, false);
        }

        done(null, _user);

    } catch(e) {
        logger.error('passport local strategy (login): something went wrong [D]');
        done(e, false);
    }
}

module.exports = {
    LocalStrategy,
    signupStrategyCallback,
    loginStrategyCallback
};
