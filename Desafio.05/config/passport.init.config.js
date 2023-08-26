const passport = require('passport');
const userManager = require('../dao/db/user.manager');

const { GitHubStrategy, gitHubStrategyCallback, gitHubAppCredentials } = require('./passport.github.config');


const bindPassportStrategies = () => {

    passport.use('github', new GitHubStrategy(gitHubAppCredentials, gitHubStrategyCallback));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })
    passport.deserializeUser(async (id, done) => {
        const user = await userManager.getById(id);

        done(null, user);
    })
};

module.exports = bindPassportStrategies;