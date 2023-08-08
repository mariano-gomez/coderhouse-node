const { Router } = require('express');
const productManager = require('../../dao/db/product.manager');
const { createProductValidatorMiddleware, updateProductValidatorMiddleware } = require('../../middlewares/ProductValidator.middleware');
const router = Router();

//  /api/products/:pid
router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await productManager.getById(pid);
    if (product) {
        res.send(product);
    } else {
        res.sendStatus(404);
    }
});

//  /api/products
router.get('/', async (req, res) => {
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

//  /api/products
router.post('/', createProductValidatorMiddleware, async (req, res) => {
    const { body } = req;

    try {
        const newProduct = await productManager.create(body);
        res.status(201).send(newProduct);
    } catch (e) {
        res.status(400).send({ "error": e.message });
    }
});

//  /api/products/:pid
router.put('/:pid', updateProductValidatorMiddleware, async (req, res) => {
    const { pid } = req.params;
    const { body } = req;

    try {
        const updateResult = await productManager.update(pid, body);
        if (updateResult.modifiedCount >= 1) {
            res.sendStatus(202);
            return;
        }

        res.sendStatus(404);

    } catch (e) {
        res.status(500).send({
            message: e.message,
            exception: e.stack
        });
    }
});

//  /api/products/:pid
router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;

    if (!await productManager.getById(pid)) {
        res.sendStatus(404);
        return;
    }

    await productManager.delete(pid);

    res.sendStatus(204);
});

module.exports = router;