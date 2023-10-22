const { Router } = require('express');
const SessionsApiController = require('../../controllers/api/sessions.controller');

const router = Router();

router.get('/current', SessionsApiController.currentUser);

router.put('/premium/:uid', SessionsApiController.swapUserRole);

module.exports = router;