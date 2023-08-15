/**
 * This function checks that all required fields are present, and has valid data
 * @param product
 * @returns {Error}
 */
function validateCreateInputs(product) {
    if (!product.title || product.title.length < 1) {
        return new Error('title should contain at least one character');
    }
    if (!product.description || product.description.length < 1) {
        return new Error('description should contain at least one character');
    }
    if (!product.code || product.code.length < 1) {
        return new Error('code should contain at least one character');
    }
    if (!product.price || product.price <= 0) {
        return new Error('price must contain a value greater than zero');
    }
    if (typeof product.status !== 'boolean') {
        return new Error('status must have a boolean value');
    }
    if (!product.stock || product.stock <= 0) {
        return new Error('stock must contain a value greater than zero');
    }
    if (!product.category || product.category.length < 1) {
        return new Error('category should contain at least one character');
    }
    if (product.id) {
        return new Error('id field is not allowed');
    }
}

module.exports = validateCreateInputs;