const passport = require('passport');

//  passport strategies
const { GitHubStrategy, gitHubStrategyCallback, gitHubAppCredentials } = require('./passport.github.config');
const { LocalStrategy, signupStrategyCallback, loginStrategyCallback } = require('./passport.local.config');

//  managers
const factory = require("../dao/factory.dao");
const cartManager = factory.getInstance('cart');
const userManager = factory.getInstance('user');

//  This variable is meant to be useful if/when I implement jwt as an option. At that point, it will be included in the .env file, for now, it is hardcoded
const SESSIONLESS = false;

const bindPassportStrategies = () => {

    if (!SESSIONLESS) {
        passport.use('github', new GitHubStrategy(gitHubAppCredentials, gitHubStrategyCallback));

        passport.use('local-signup', new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, signupStrategyCallback))
        passport.use('local-login', new LocalStrategy({ usernameField: 'email' }, loginStrategyCallback))

        passport.serializeUser((user, done) => {
            done(null, user._id);
        })
        passport.deserializeUser(async (id, done) => {
            if (id) {
                const user = await userManager.getById(id);

                //  (i think) higly unefficient, search if there isn't a better approach/workaround
                const cart = await cartManager.getByUser(user._id);

                const role = (user.email === 'adminCoder@coder.com' && user.password === 'adminCod3r123') ? 'admin' : 'usuario';
                delete user.password;

                done(null, {
                    role,
                    cart,
                    name: user.first_name,
                    ...user
                });
            } else {
                done (null, false);
            }
        });
    }
};

module.exports = bindPassportStrategies;