const ProductManager = require('../managers/ProductManager');

const productManager = new ProductManager('products.json');

const checkProductExistsValidatorMiddleware = async (req, res, next) => {
    const { pid } = req.params;

    const existingProduct = await productManager.getById(pid);
    if (!existingProduct) {
        res.status(400).send({ "error": "Product doesn't exists" });
        return;     //  If I don't add this, I get this error on the server console: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`
    }
    next();
};

module.exports = checkProductExistsValidatorMiddleware;