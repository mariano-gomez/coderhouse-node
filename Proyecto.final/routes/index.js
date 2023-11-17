const { Router } = require('express');

const apiAuthWithSessionsRoutes = require('./api/users.router');
const productsRoutes = require('./api/products.router');
const cartsRoutes = require('./api/carts.router');
const standardRoutes = require('./standard.router');
const authRoutes = require('./users.router');

const router = Router();
router.use('/products', productsRoutes);
router.use('/carts', cartsRoutes);

//  This variable is meant to be useful if/when I implement jwt as an option. At that point, it will be included in the .env file, for now, it is hardcoded
const SESSIONLESS = false;

if (!SESSIONLESS) {
    //  enables routes that depends on sessions
    router.use('/users', apiAuthWithSessionsRoutes);
}

module.exports = {
    apiRoutes: router,
    standardRoutes: standardRoutes,
    authRoutes: authRoutes
};