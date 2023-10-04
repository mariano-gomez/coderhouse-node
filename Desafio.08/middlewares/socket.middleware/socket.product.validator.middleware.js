const CustomError = require("../../utils/custom.error.utils");

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

module.exports = validateCreateInputs;