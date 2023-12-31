const express = require('express');
const checkProductExistsValidatorMiddleware = require('../../middlewares/CheckProductExistsValidator.middleware');
const cartAddingProductValidatorMiddleware = require('../../middlewares/cartAddingProductValidator.middleware');
const CartsApiController = require('../../controllers/api/carts.controller');

const router = express.Router();

//  /api/carts [create a new cart]
router.post('/', CartsApiController.createNewCart);

//  /api/carts/:cid [get a specific cart content]
router.get('/:cid', CartsApiController.showCart);

//  /api/carts/:cid/product/:pid    [increments a product quantity/add one unit to the cart if it does not exist]
router.post('/:cid/product/:pid', cartAddingProductValidatorMiddleware, checkProductExistsValidatorMiddleware, CartsApiController.incrementProductQuantity);

//  api/carts/:cid/products/:pid [removes a specific product from a specific cart]
router.delete('/:cid/product/:pid', CartsApiController.removeProductFromCart);

//  api/carts/:cid  [it removes all products from the cart]
router.delete('/:cid', CartsApiController.emptyCart);

//  api/carts/:cid/products/:pid [set the quantity for a specific cart and product]
router.put(
    '/:cid/product/:pid',
    express.raw({ type: '*/*' }),  //   middleware to fetch the raw body from the request
    CartsApiController.changeProductQuantityOnCart
);

//  It replaces all the products in the given cart, for the ones specified on the request
router.put('/:cid', CartsApiController.changeCartContent);

module.exports = router;