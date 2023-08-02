const Router = require('express');
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager('products.json');

const { createProductValidatorMiddleware } = require('../middlewares/ProductValidator.middleware');

const router = Router();

router.get('/', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', {
        products
    });
});

router.post('/products',
    //  kind of middleware patch, to force the `status` field (if it comes) to be casted into boolean.
    // Otherwise, it will fail in the following validation middleware
    (req, res, next) => {
    console.log(req.body.status);
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
        products
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