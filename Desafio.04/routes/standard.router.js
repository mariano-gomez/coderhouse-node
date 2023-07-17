const Router = require('express');
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager('products.json');

const router = Router();

router.get('/', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', {
        products
    });
});

router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getAll();
    res.render('realTimeProducts', {
        products
    });
});

//  This method is meant to provide a response for any other endpoint/url that doesn't exists
    router.all('*', (req, res) => {
        res.statusCode = 404;
        console.log(`An invalid url has been required`);
        res.send({ "Error": "The required URL doesn't exists" });
    });

module.exports = router;