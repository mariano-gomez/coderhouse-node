const { Router } = require('express');

const { SESSIONLESS } = require("../config/global.variables.config");
const apiAuthWithSessionsRoutes = require('./api/sessions.router');
const productsRoutes = require('./api/products.router');
const cartsRoutes = require('./api/carts.router');
const standardRoutes = require('./standard.router');
const authRoutes = require('./users.router');

const router = Router();
router.use('/products', productsRoutes);
router.use('/carts', cartsRoutes);

if (!SESSIONLESS) {
    //  enables routes that depends on sessions
    router.use('/sessions', apiAuthWithSessionsRoutes);
}

module.exports = {
    apiRoutes: router,
    standardRoutes: standardRoutes,
    authRoutes: authRoutes
};