const GitHubStrategy = require('passport-github2');
const dependencyContainer = require('../dependency.injection');
const factory = require("../dao/factory.dao");
const userManager = factory.getInstance('user');
const cartManager = factory.getInstance('cart');

//  I could use `process.env.<variableName> directly, but the requirements says i need to create a `confing.js` file, so i did it according to what we did in the course
const _dotenv = dependencyContainer.get('dotenv');
const logger = dependencyContainer.get('logger');

const gitHubAppCredentials = {
    clientID:       _dotenv.GITHUB_CLIENT_ID,
    clientSecret:   _dotenv.GITHUB_CLIENT_SECRET,
    callbackURL:    _dotenv.GITHUB_CALLBACK_URL
};

const gitHubStrategyCallback = async (accessToken, refreshToken, profile, done) => {
    const userData = profile._json;

    if (!userData.email) {
        return done(null, false, { message: `email is null. Check profile's email configuration` });
    }

    //  since these variables will be used within several try/catch blocks, i need to declare them outside and, therefore, as let, not as const
    let user, cart, newUser;

    try {
        user = await userManager.getByEmail(userData.email);
    } catch (error) {
        return done(error.message, false);
    }

    if (!user) {
        try {
            logger.info('new user!');

            const newUserData = {
                first_name: userData.name.split(" ")[0],
                last_name: userData.name.split(" ")[1],

                email: userData.email,
                password: "",
                forgotPasswordRequestDate: null,
                gender: null
            }

            newUser = await userManager.create(newUserData);
        } catch (error) {
            return done('passport github strategy: ' + error.message, false);
        }

        //  The user is going to need a cart
        try {
            cart = await cartManager.create(newUser._id);
        } catch(e) {
            logger.error('passport github strategy: something went wrong');
            //  if there is a problem creating the cart, the user should be removed
            await userManager.delete(newUser._id);
            return done(e.message, false);
        }

        //  finally, link the cart to the user's data and return the user
        try {
            await userManager.save(newUser._id, {
                cart,
                ...newUser
            });

            return done(null, {
                name: newUser.first_name,
                ...newUser
            });

        } catch(e) {
            //  if there is a problem linking the user and the cart, we need to remove both from the DB
            await userManager.delete(newUser._id);
            await cartManager.delete(cart._id);
            logger.error('passport github strategy: something went wrong');
            return done(e.message, false);
        }

    }
    //  if the user exists, i simply return it
    return done(null, user);
};

module.exports = {
    GitHubStrategy,         //  The actual `GitHubStrategy` class i must instantiate
    gitHubStrategyCallback,
    gitHubAppCredentials
};