const Router = require('express');

const MockerController = require('../controllers/mocker.controller');

const router = Router();

router.get('/mockingproducts', MockerController.mockProducts);

module.exports = router;