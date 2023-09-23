const { Router } = require('express');
const { createProductValidatorMiddleware, updateProductValidatorMiddleware } = require('../../middlewares/ProductValidator.middleware');
const CartsApiController = require('../../controllers/api/products.controller');

const router = Router();

//  /api/products/:pid
router.get('/:pid', CartsApiController.getProduct);

//  /api/products
router.get('/', CartsApiController.getProducts);

//  /api/products
router.post('/', createProductValidatorMiddleware, CartsApiController.createProduct);

//  /api/products/:pid
router.put('/:pid', updateProductValidatorMiddleware, CartsApiController.updateProduct);

//  /api/products/:pid
router.delete('/:pid', CartsApiController.deleteProduct);

module.exports = router;