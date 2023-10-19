const express = require('express');
const checkProductExistsValidatorMiddleware = require('../../middlewares/CheckProductExistsValidator.middleware');
const cartAddingProductValidatorMiddleware = require('../../middlewares/cartAddingProductValidator.middleware');
const ownProductCantBeAddedToCart = require('../../middlewares/auth/own.product.cant.be.added.to.cart.middleware');
const CartsApiController = require('../../controllers/api/carts.controller');
const authorizeRole = require("../../middlewares/auth/authorize.role.middleware");

const router = express.Router();

//  /api/carts [create a new cart]
router.post('/', CartsApiController.createNewCart);

//  /api/carts/:cid [get a specific cart content]
router.get('/:cid', CartsApiController.showCart);

//  /api/carts/:cid/product/:pid    [increments a product quantity/add one unit to the cart if it does not exist]
router.post('/:cid/product/:pid',
    authorizeRole(['user', 'premium']),
    ownProductCantBeAddedToCart,
    cartAddingProductValidatorMiddleware,
    checkProductExistsValidatorMiddleware,
    CartsApiController.incrementProductQuantity
);

//  api/carts/:cid/products/:pid [removes a specific product from a specific cart]
router.delete('/:cid/product/:pid', authorizeRole(['user', 'premium']), CartsApiController.removeProductFromCart);

//  api/carts/:cid  [it removes all products from the cart]
router.delete('/:cid', authorizeRole(['user', 'premium']), CartsApiController.emptyCart);

//  api/carts/:cid/products/:pid [set the quantity for a specific cart and product]
router.put(
    '/:cid/product/:pid',
    authorizeRole(['user', 'premium']),
    ownProductCantBeAddedToCart,
    express.raw({ type: '*/*' }),  //   middleware to fetch the raw body from the request
    CartsApiController.changeProductQuantityOnCart
);

//  It replaces all the products in the given cart, for the ones specified on the request
router.put('/:cid',
    authorizeRole(['user', 'premium']),
    //  TODO: create a middleware that checks for the owner of each product in the request (must check the body)
    CartsApiController.changeCartContent
);

router.put('/:cid/purchase', authorizeRole(['user', 'premium']), CartsApiController.purchase);

module.exports = router;