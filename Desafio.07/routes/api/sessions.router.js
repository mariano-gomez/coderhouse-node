const { Router } = require('express');
const SessionsApiController = require('../../controllers/api/sessions.controller');

const router = Router();

router.get('/current', SessionsApiController.currentUser);

module.exports = router;