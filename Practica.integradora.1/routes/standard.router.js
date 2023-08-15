const Router = require('express');
const productManager = require('../dao/db/product.manager');
const cartManager = require('../dao/db/cart.manager');

const { createProductValidatorMiddleware } = require('../middlewares/ProductValidator.middleware');

const router = Router();

router.get('/', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', {
        products,
        cid: req.cart?.id
    });
});

router.get('/cart/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await cartManager.getById(cid);

    //  in case the cart is empty
    const products = cart?.products || [];

    res.render('cart', {
        products,
        cid
    });
});

router.post('/cart/:cid/product/:pid/add', async (req, res) => {
    const { cid, pid } = req.params;

    await cartManager.addProduct(cid, pid);

    res.redirect('back');
});

router.get('/cart/:cid/product/:pid/delete', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const result = await cartManager.deleteProduct(cid, pid);
    } catch (e) {
        console.log(e.message);
    }

    res.redirect(`/cart/${cid}`);
});

router.get('/chat', async (req, res) => {
    res.render('chat', {
        cid: req.cart?.id
    });
});

router.post('/products',
    //  kind of middleware patch, to force the `status` field (if it comes) to be casted into boolean.
    // Otherwise, it will fail in the following validation middleware
    (req, res, next) => {
    if (req.body.status != undefined) {
        req.body.status = (req.body.status === "true");
    }
    next();

}, createProductValidatorMiddleware, async (req, res) => {
    const { body } = req;

    try {
        await productManager.create(body);
        res.redirect('/');
    } catch (e) {
        res.status(400).send({ "error": e.message });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getAll();
    res.render('realTimeProducts', {
        products,
        cartId: req.cart?.id
    });
});

router.get('/products/delete/:pid', async (req, res) => {
    const { pid } = req.params;

    if (!await productManager.getById(pid)) {
        res.sendStatus(404);
    }

    await productManager.delete(pid);
    res.redirect('/');
});

//  This method is meant to provide a response for any other endpoint/url that doesn't exists
router.all('*', (req, res) => {
    res.statusCode = 404;
    console.log(`An invalid url has been required`);
    res.send({ "Error": "The required URL doesn't exists" });
});

module.exports = router;