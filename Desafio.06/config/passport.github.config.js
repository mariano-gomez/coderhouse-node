const GitHubStrategy = require('passport-github2');
const userManager = require('../dao/db/user.manager');
const cartManager = require('../dao/db/cart.manager');

const gitHubAppCredentials = {
    clientID:       'Iv1.9d3533b922a6c031',
    clientSecret:   'bb60d9378c871a9a8c8a750786c61da9cae3de62',
    callbackURL:    "http://localhost:8080/githubSessions"
};

const gitHubStrategyCallback = async (accessToken, refreshToken, profile, done) => {
    const userData = profile._json;

    if (!userData.email) {
        return done(new Error(`email is null. Check profile's email configuration`));
    }

    try {
        const user = await userManager.getByEmail(userData.email);

        if (!user) {
            console.log('new user!');

            const newUser = {
                firstname: userData.name.split(" ")[0],
                lastname: userData.name.split(" ")[1],

                email: userData.email,
                password: "",
                gender:null
            }

            const result = await userManager.create(newUser);
            await cartManager.create(result._id);

            return done(null, result);
        }
        return done(null, user);

    } catch (error) {
        return done(error);
    }
};

module.exports = {
    GitHubStrategy,         //  The actual `GitHubStrategy` class i must instantiate
    gitHubStrategyCallback,
    gitHubAppCredentials
};