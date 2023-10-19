const CustomError = require('../../utils/custom.error.utils');
const daoFactory = require('../../dao/factory.dao');
const productManager = daoFactory.getInstance('product');

//  TODO: try to refactor this code into one middleware with the single `own.product.cant.be.added.to.cart.middleware`
async function ownProductCantBeAddedToCart(req, res, next) {
    if (!req.user) {
        return next(new CustomError(`Product not specified`, CustomError.ERROR_TYPES.PERMISSION_ERROR, 403));
    }

    const { products } = req.body;

    for (const cartProduct of products) {
        const dbProduct = await productManager.getById(cartProduct.product._id);

        if (!dbProduct) {
            return next(new CustomError(`Product not found: ${cartProduct.product._id}`, CustomError.ERROR_TYPES.DATABASE_ERROR, 404));
        }

        //  if the owner is the same user that is trying to add it to its cart, an error should be raised
        if (req.user.email == dbProduct.owner) {
            return next(new CustomError(`You can't buy your own products ${cartProduct.product._id}`, CustomError.ERROR_TYPES.PERMISSION_ERROR, 405));
        }
    }
    return next();
}

module.exports = ownProductCantBeAddedToCart;
