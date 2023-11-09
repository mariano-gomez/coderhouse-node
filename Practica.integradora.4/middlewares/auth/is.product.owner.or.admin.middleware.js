const CustomError = require('../../utils/custom.error.utils');
const daoFactory = require('../../dao/factory.dao');
const productManager = daoFactory.getInstance('product');

async function isProductOwnerOrAdmin(req, res, next) {
    if (!req.user) {
        return res.status(403).send({ error: `User cannot be identified` });
    }

    if (req.user.role == 'admin') {
        return next();
    }

    if (req.user.role == 'premium') {
        const productId = req.params.pid;
        if (!productId) {
            return next(new CustomError(`Product not specified`, CustomError.ERROR_TYPES.DATABASE_ERROR, 500));
        }

        const product = await productManager.getById(productId);
        if (!product) {
            return next(new CustomError(`Product not found`, CustomError.ERROR_TYPES.DATABASE_ERROR, 500));
        }
        if (product.owner !== req.user.email) {
            return next(new CustomError(`This action is not allowed`, CustomError.ERROR_TYPES.DATABASE_ERROR, 403));
        } else {
            return next();
        }
    }
    res.status(403).send({ error: `User don't have required role` });
}

module.exports = isProductOwnerOrAdmin;
