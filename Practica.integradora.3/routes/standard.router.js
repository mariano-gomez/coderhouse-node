const Router = require('express');
const isAuth = require('../middlewares/auth/is.auth.middleware');
const authorizeRole = require('../middlewares/auth/authorize.role.middleware');
const ownProductCantBeAddedToCart = require('../middlewares/auth/own.product.cant.be.added.to.cart.middleware');
const StandardController = require('../controllers/standard.controller');
const mockerRoutes = require('./mocker.router');

const { createProductValidatorMiddleware } = require('../middlewares/ProductValidator.middleware');
const cartAddingProductValidatorMiddleware = require("../middlewares/cartAddingProductValidator.middleware");
const checkProductExistsValidatorMiddleware = require("../middlewares/CheckProductExistsValidator.middleware");

const router = Router();

router.use(mockerRoutes);

router.get('/', isAuth, StandardController.showMainPage);

router.get('/cart/:cid', isAuth, StandardController.showCartPageById);

router.post('/cart/:cid/product/:pid/add',
    authorizeRole(['user', 'premium']),
    ownProductCantBeAddedToCart,
    cartAddingProductValidatorMiddleware,
    checkProductExistsValidatorMiddleware,
    StandardController.addProductOnCart
);

router.get('/cart/:cid/product/:pid/delete', StandardController.deleteProductOnCart);

router.get('/chat', isAuth, StandardController.showChatPage);

router.post('/products',
    //  kind of middleware patch, to force the `status` field (if it comes) to be casted into boolean.
    // Otherwise, it will fail in the following validation middleware
    (req, res, next) => {
        if (req.body.status != undefined) {
            req.body.status = (req.body.status === "true");
        }
        next();
    },
    authorizeRole(['admin', 'premium']),
    createProductValidatorMiddleware,
    StandardController.createProduct
);

router.get('/realtimeproducts', isAuth, StandardController.showRealtimeProductsPage);

router.get('/products/delete/:pid',
    authorizeRole(['admin', 'premium']),
    StandardController.deleteProductFromPage
);

router.get('/loggerTest', StandardController.loggerTest);

//  This method is meant to provide a response for any other endpoint/url that doesn't exists
router.all('*', StandardController.defaultResponse);

module.exports = router;