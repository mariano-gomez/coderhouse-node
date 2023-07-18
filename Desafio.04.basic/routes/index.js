const { Router } = require('express');
const router = Router();
const { createProductValidatorMiddleware } = require('../middlewares/ProductValidator.middleware');
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager('productos.json');

router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await productManager.getById(parseInt(pid));
    if (product) {
        res.send(product);
    } else {
        res.send({"Error": "El producto solicitado no existe"});
    }
});

router.get('/products', async (req, res) => {
    const { limit } = req.query;
    const products = await productManager.getAll();

    //  si se ingresa un limite menor a cero puede romper el server
    if (limit > 0 && limit < products.length) {
        const productsSublist = products.slice(0, limit);
        res.send(productsSublist);
    } else {
        res.send(products);
    }
});

router.post('/products', createProductValidatorMiddleware, async (req, res) => {
    const { body } = req;

    try {
        await productManager.create(body);
        res.redirect('/');
    } catch (e) {
        res.status(400).send({ "error": e.message });
    }
});

router.get('/products/delete/:pid', async (req, res) => {
    const { pid } = req.params;

    if (!await productManager.getById(pid)) {
        res.sendStatus(404);
    }

    await productManager.delete(pid);
    res.redirect('/');
});

//  Para cualquier otra ruta no existente
router.get('/', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', {
        products
    });
});

router.get('/realtimeproducts', async (req, res) => {
    res.render('realTimeProducts');
});

//  Para cualquier otra ruta no existente
router.get('*', (req, res) => {
    res.statusCode = 404;
    console.log('Se ha intentado acceder a una ruta inexistente');
    res.send({"Error": "Esa URL no existe"});
});


module.exports = router;