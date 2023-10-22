const { Router } = require('express');
const { createProductValidatorMiddleware, updateProductValidatorMiddleware } = require('../../middlewares/ProductValidator.middleware');
const authorizeRole = require('../../middlewares/auth/authorize.role.middleware');
const isProductOwnerOrAdmin = require('../../middlewares/auth/is.product.owner.or.admin.middleware');
const CartsApiController = require('../../controllers/api/products.controller');

const router = Router();

//  /api/products/:pid
router.get('/:pid', CartsApiController.getProduct);

//  /api/products
router.get('/', CartsApiController.getProducts);

//  /api/products
router.post('/',
    authorizeRole(['admin', 'premium']),
    createProductValidatorMiddleware,
    CartsApiController.createProduct
);

//  /api/products/:pid
router.put('/:pid',
    authorizeRole(['admin', 'premium']),
    isProductOwnerOrAdmin,
    updateProductValidatorMiddleware,
    CartsApiController.updateProduct
);

//  /api/products/:pid
router.delete('/:pid',
    authorizeRole(['admin', 'premium']),
    isProductOwnerOrAdmin,
    CartsApiController.deleteProduct
);

module.exports = router;