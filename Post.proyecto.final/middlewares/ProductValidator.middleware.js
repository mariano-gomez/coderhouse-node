const CustomError = require('../utils/custom.error.utils');

/**
 * This function checks that all required fields are present, and has valid data
 * @param product
 * @returns {CustomError}
 */
function validateCreateInputs(product) {
    if (!product.title || product.title.length < 1) {
        return new CustomError('title should contain at least one character', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (!product.description || product.description.length < 1) {
        return new CustomError('description should contain at least one character', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (!product.code || product.code.length < 1) {
        return new CustomError('code should contain at least one character', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (!product.price || product.price <= 0) {
        return new CustomError('price must contain a value greater than zero', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (typeof product.status !== 'boolean') {
        return new CustomError('status must have a boolean value', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (!product.stock || product.stock <= 0) {
        return new CustomError('stock must contain a value greater than zero', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (!product.category || product.category.length < 1) {
        return new CustomError('category should contain at least one character', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (product.id) {
        return new CustomError('id field is not allowed', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
}

/**
 * This function checks that, if certain fields are present, then it contains valid input. If the fields aren't present,
 * it skips them
 * @param product
 * @returns {CustomError}
 */
function validateUpdateInputs(product) {
    if (product.title !== undefined && product.title.length < 1) {
        return new CustomError('title should contain at least one character', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (product.description !== undefined && product.description.length < 1) {
        return new CustomError('description should contain at least one character', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (product.code !== undefined && product.code.length < 1) {
        return new CustomError('code should contain at least one character', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (product.price !== undefined && product.price <= 0) {
        return new CustomError('price must contain a value greater than zero', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (product.status !== undefined && typeof product.status !== 'boolean') {
        return new CustomError('status must have a boolean value', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (product.stock !== undefined && product.stock <= 0) {
        return new CustomError('stock must contain a value greater than zero', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (product.category !== undefined && product.category.length < 1) {
        return new CustomError('category should contain at least one character', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
    if (product.id) {
        return new CustomError('id field is not allowed', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
    }
}

/**
 * This method is meant to be a validator for the POST/PUT products' requests
 */
const createProductValidator = (req, res, next) => {
    const { body } = req;
    if (body.status === undefined) {
        body.status = true;
    }
    req.body = body;

    const error = validateCreateInputs(body);
    if (error) {
        return next(error);     //  If I don't add this, I get this error on the server console: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`
    }
    next();
};

const updateProductValidator = (req, res, next) => {
    const { body } = req;
    req.body = body;

    const error = validateUpdateInputs(body);
    if (error) {
        res.status(400).send({ "error": error.message });
        return;     //  If I don't add this, I get this error on the server console: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`
    }
    next();
};

module.exports = {
    createProductValidatorMiddleware: createProductValidator,
    updateProductValidatorMiddleware: updateProductValidator
};