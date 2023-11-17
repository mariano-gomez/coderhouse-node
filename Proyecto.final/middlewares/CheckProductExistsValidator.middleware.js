const factory = require("../dao/factory.dao");
const productManager = factory.getInstance('product');
const cartManager = factory.getInstance('cart');

const checkProductExistsValidatorMiddleware = async (req, res, next) => {
    const { cid, pid } = req.params;

    try {
        const existingProduct = await productManager.getById(pid);
        if (!existingProduct) {
            res.status(400).send({ "error": "Product doesn't exists" });
            return;
        }
    } catch (e) {
        res.status(400).send({ "error": "Product doesn't exists" });
        return;
    }

    try {
        const existingCart = await cartManager.getById(cid);
        if (!existingCart) {
            res.status(400).send({ "error": "Cart doesn't exists" });
            return;
        }
    } catch (e) {
        res.status(400).send({ "error": "Cart doesn't exists" });
        return;
    }

    next();
};

module.exports = checkProductExistsValidatorMiddleware;