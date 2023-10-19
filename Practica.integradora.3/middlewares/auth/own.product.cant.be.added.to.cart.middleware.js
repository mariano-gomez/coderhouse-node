const CustomError = require('../../utils/custom.error.utils');
const daoFactory = require('../../dao/factory.dao');
const productManager = daoFactory.getInstance('product');

async function ownProductCantBeAddedToCart(req, res, next) {
    if (!req.user) {
        return next(new CustomError(`Product not specified`, CustomError.ERROR_TYPES.PERMISSION_ERROR, 403));
    }

    const { pid } =  req.params;
    const product = await productManager.getById(pid);

    if (!product) {
        return next(new CustomError(`Product not found`, CustomError.ERROR_TYPES.DATABASE_ERROR, 404));
    }

    //  if the owner is the same user that is trying to add it to its cart, an error should be raised
    if (req.user.email == product.owner) {
        return next(new CustomError(`You can't buy your own products`, CustomError.ERROR_TYPES.PERMISSION_ERROR, 405));
    }
    return next();
}

module.exports = ownProductCantBeAddedToCart;
