/**
 * This function checks that all required fields are present, and has valid data
 * @param product
 * @returns {Error}
 */
function validateCreateInputs(product) {
    if (!product.title || product.title.length < 1) {
        return new Error('title should contain at least one character');
    }
    if (!product.price || product.price <= 0) {
        return new Error('price must contain a value greater than zero');
    }
    if (!product.description || product.description.length < 1) {
        return new Error('description should contain at least one character');
    }
}

/**
 * This function checks that, if certain fields are present, then it contains valid input. If the fields aren't present,
 * it skips them
 * @param product
 * @returns {Error}
 */
function validateUpdateInputs(product) {
    if (product.title !== undefined && product.title.length < 1) {
        return new Error('title should contain at least one character');
    }
    if (product.description !== undefined && product.description.length < 1) {
        return new Error('description should contain at least one character');
    }
    if (product.code !== undefined && product.code.length < 1) {
        return new Error('code should contain at least one character');
    }
    if (product.price !== undefined && product.price <= 0) {
        return new Error('price must contain a value greater than zero');
    }
    if (product.status !== undefined && typeof product.status !== 'boolean') {
        return new Error('status must have a boolean value');
    }
    if (product.stock !== undefined && product.stock <= 0) {
        return new Error('stock must contain a value greater than zero');
    }
    if (product.category !== undefined && product.category.length < 1) {
        return new Error('category should contain at least one character');
    }
    if (product.id) {
        return new Error('id field is not allowed');
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
        res.status(400).send({ "error": error.message });
        return;     //  If I don't add this, I get this error on the server console: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`
    }
    next();
};

module.exports = {
    createProductValidatorMiddleware: createProductValidator,
};