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

    //  since these variables will be used within several try/catch blocks, i need to declare them outside and, therefore, as let, not as const
    let user, cart, newUser;

    try {
        user = await userManager.getByEmail(userData.email);
    } catch (error) {
        return done(error);
    }

    if (!user) {
        try {
            console.log('new user!');

            const newUserData = {
                first_name: userData.name.split(" ")[0],
                last_name: userData.name.split(" ")[1],

                email: userData.email,
                password: "",
                gender: null
            }

            newUser = await userManager.create(newUserData);
        } catch (error) {
            return done('passport github strategy: ' + error);
        }

        //  The user is going to need a cart
        try {
            cart = await cartManager.create(newUser._id);
        } catch(e) {
            console.log('passport local strategy (signup): something went wrong');
            //  if there is a problem creating the cart, the user should be removed
            await userManager.delete(newUser._id);
            done(e, false);
        }

        //  finally, link the cart to the user's data and return the user
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
    //  if the user exists, i simply return it
    return done(null, user);
};

module.exports = {
    GitHubStrategy,         //  The actual `GitHubStrategy` class i must instantiate
    gitHubStrategyCallback,
    gitHubAppCredentials
};