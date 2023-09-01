const local = require('passport-local');

const userManager = require('../dao/db/user.manager');
const { hashPassword, isValidPassword } = require('../utils/password.encrypter.utils');
const cartManager = require("../dao/db/cart.manager");

const LocalStrategy = local.Strategy;

const signupStrategyCallback = async (req, email, password, done) => {
    const { email: _email, password: _password, password2: _password2, ...user } = req.body;

    const _user = await userManager.getByEmail(email);

    if (_user) {
        console.log('passport local strategy (signup): user already exists');
        return done(null, false);
    }

    try {
        const newUser = await userManager.create({
            ...user,
            email,
            password: hashPassword(password)
        });

    } catch(e) {
        console.log('passport local strategy (signup): something went wrong');
        done(e, false);
    }

    try {
        //  The user is going to need a cart
        const cart = await cartManager.create(newUser._id);
    } catch(e) {
        console.log('passport local strategy (signup): something went wrong');
        //  if there is a problem creating the cart, the user should be removed
        await userManager.delete(newUser._id);
        done(e, false);
    }

    try {
        await userManager.save(newUser._id, {
            cart,
            ...newUser
        });

        return done(null, {
            name: newUser.first_name,
            id: newUser._id,
            cart,
            ...newUser._doc
        });

    } catch(e) {
        //  if there is a problem linking the user and the cart, we need to remove both from the DB
        await userManager.delete(newUser._id);
        await cartManager.delete(cart._id);
        console.log('passport local strategy (signup): something went wrong');
        done(e, false);
    }
}

const loginStrategyCallback = async (email, password, done) => {
    try {
        const _user = await userManager.getByEmail(email);

        if (!_user) {
            console.log('passport local strategy (login): user not found');
            return done(null, false);
        }

        if (!password) {
            return done(null, false);
        }

        if(!isValidPassword(password, _user.password)) {
            console.log('passport local strategy (login): credentials mismatch');
            return done(null, false);
        }

        done(null, _user);

    } catch(e) {
        console.log('passport local strategy (login): something went wrong');
        done(e, false);
    }
}

module.exports = {
    LocalStrategy,
    signupStrategyCallback,
    loginStrategyCallback
};
