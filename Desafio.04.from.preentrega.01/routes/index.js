const { Router } = require('express');
const productsRoutes = require('./api/products.router');
const cartsRoutes = require('./api/carts.router');
const standardRoutes = require('./standard.router');

const router = Router();
router.use('/products', productsRoutes);
router.use('/carts', cartsRoutes);

module.exports = {
    apiRoutes: router,
    standardRoutes: standardRoutes
};