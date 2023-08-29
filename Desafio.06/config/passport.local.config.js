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

        //  The user is gonna need a cart
        await cartManager.create(newUser._id);

        return done(null, {
            name: newUser.firstname,
            id: newUser._id,
            ...newUser._doc
        });

    } catch(e) {
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
            console.log('passport local strategy (login): credentials missmatch');
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
