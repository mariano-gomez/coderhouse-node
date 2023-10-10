const passport = require('passport');

//  managers
const factory = require("../dao/factory.dao");
const cartManager = factory.getInstance('cart');
const userManager = factory.getInstance('user');

//  passport strategies
const { GitHubStrategy, gitHubStrategyCallback, gitHubAppCredentials } = require('./passport.github.config');
const { LocalStrategy, signupStrategyCallback, loginStrategyCallback } = require('./passport.local.config');

const dependencyContainer = require("../dependency.injection");
const logger = dependencyContainer.get('logger');

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
                try {
                    const user = await userManager.getById(id);

                    const { cart: _cart, ...userData } = user;

                    //  (i think) higly unefficient, search if there isn't a better approach/workaround
                    const cart = await cartManager.getByUser(user._id);

                    delete user.password;

                    done(null, {
                        cart,
                        name: user.first_name,
                        ...userData
                    });
                } catch (e) {
                    logger.error(e.message);
                }
            } else {
                done (null, false);
            }
        });
    }
};

module.exports = bindPassportStrategies;