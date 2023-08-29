const passport = require('passport');

const { GitHubStrategy, gitHubStrategyCallback, gitHubAppCredentials } = require('./passport.github.config');
const { LocalStrategy, signupStrategyCallback, loginStrategyCallback } = require('./passport.local.config');
const userManager = require('../dao/db/user.manager');
const cartManager = require("../dao/db/cart.manager");


const bindPassportStrategies = () => {

    passport.use('github', new GitHubStrategy(gitHubAppCredentials, gitHubStrategyCallback));

    passport.use('local-signup', new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, signupStrategyCallback))
    passport.use('local-login', new LocalStrategy({ usernameField: 'email' }, loginStrategyCallback))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })
    passport.deserializeUser(async (id, done) => {
        const user = await userManager.getById(id);

        //  (i think) higly unefficient, search if there isn't a better approach/workaround
        const cart = await cartManager.getByUser(user._id);

        const role = (user.email === 'adminCoder@coder.com' && user.password === 'adminCod3r123') ? 'admin' : 'usuario';
        delete user.password;

        done(null, {
            role,
            cart,
            name: user.firstname,
            ...user
        });
    })
};

module.exports = bindPassportStrategies;