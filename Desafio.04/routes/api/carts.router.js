const { Router } = require('express');
const CartManager = require('../../managers/CartManager');
const checkProductExistsValidatorMiddleware = require('../../middlewares/CheckProductExistsValidator.middleware');
const cartAddingProductValidatorMiddleware = require('../../middlewares/cartAddingProductValidator.middleware');

const router = Router();
const cartManager = new CartManager('carts.json');

//  /api/carts
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.create();
        res.status(201).send(newCart);
    } catch (e) {
        res.status(400).send({ "error": e.message });
    }
});

//  /api/carts/:cid
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;

    const cart = await cartManager.getById(parseInt(cid));
    if (cart) {
        res.send(cart.products);
    } else {
        res.sendStatus(404);
    }
});

//  /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', cartAddingProductValidatorMiddleware, checkProductExistsValidatorMiddleware, async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cartUpdated = await cartManager.addProduct(cid, pid);
        if (cartUpdated === null) {
            res.sendStatus(404);
            return;
        }
        res.status(200).send(cartUpdated.products);
    } catch (e) {
        res.status(400).send({ "error": e.message });
    }
});

module.exports = router;