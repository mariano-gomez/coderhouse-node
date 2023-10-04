const Router = require('express');
const isAuth = require('../middlewares/auth/is.auth.middleware');
const StandardController = require('../controllers/standard.controller');
const mockerRoutes = require('./mocker.router');

const { createProductValidatorMiddleware } = require('../middlewares/ProductValidator.middleware');

const router = Router();

router.use(mockerRoutes);

router.get('/', isAuth, StandardController.showMainPage);

router.get('/cart/:cid', isAuth, StandardController.showCartPageById);

router.post('/cart/:cid/product/:pid/add', StandardController.addProductOnCart);

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
    }, createProductValidatorMiddleware, StandardController.createProduct);

router.get('/realtimeproducts', isAuth, StandardController.showRealtimeProductsPage);

router.get('/products/delete/:pid', StandardController.deleteProductFromPage);

//  This method is meant to provide a response for any other endpoint/url that doesn't exists
router.all('*', StandardController.defaultResponse);

module.exports = router;