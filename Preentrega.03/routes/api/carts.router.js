const express = require('express');
const checkProductExistsValidatorMiddleware = require('../../middlewares/CheckProductExistsValidator.middleware');
const cartAddingProductValidatorMiddleware = require('../../middlewares/cartAddingProductValidator.middleware');
const CartsApiController = require('../../controllers/api/carts.controller');
const authorizeSelfCartUpdateOnly = require('../../middlewares/auth/authorize.self.cart.update.only.middleware');

const router = express.Router();

//  /api/carts [create a new cart]
router.post('/', CartsApiController.createNewCart);

//  /api/carts/:cid [get a specific cart content]
router.get('/:cid', CartsApiController.showCart);

//  /api/carts/:cid/product/:pid    [increments a product quantity/add one unit to the cart if it does not exist]
router.post('/:cid/product/:pid',
    authorizeSelfCartUpdateOnly,
    cartAddingProductValidatorMiddleware,
    checkProductExistsValidatorMiddleware,
    CartsApiController.incrementProductQuantity
);

//  api/carts/:cid/products/:pid [removes a specific product from a specific cart]
router.delete('/:cid/product/:pid', authorizeSelfCartUpdateOnly, CartsApiController.removeProductFromCart);

//  api/carts/:cid  [it removes all products from the cart]
router.delete('/:cid', authorizeSelfCartUpdateOnly, CartsApiController.emptyCart);

//  api/carts/:cid/products/:pid [set the quantity for a specific cart and product]
router.put(
    '/:cid/product/:pid',
    authorizeSelfCartUpdateOnly,
    express.raw({ type: '*/*' }),  //   middleware to fetch the raw body from the request
    CartsApiController.changeProductQuantityOnCart
);

//  It replaces all the products in the given cart, for the ones specified on the request
router.put('/:cid', authorizeSelfCartUpdateOnly, CartsApiController.changeCartContent);

router.get('/:cid/purchase', CartsApiController.purchase);

module.exports = router;