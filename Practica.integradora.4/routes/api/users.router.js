const { Router } = require('express');
const UsersApiController = require('../../controllers/api/users.controller');

const router = Router();

router.get('/current', UsersApiController.currentUser);

router.put('/premium/:uid', UsersApiController.swapUserRole);

module.exports = router;