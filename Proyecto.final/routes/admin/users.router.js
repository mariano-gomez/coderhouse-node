const { Router } = require('express');
const AdminUsersController = require("../../controllers/admin/users.controller");

const router = Router();

router.get('/', AdminUsersController.listUsersPage);

module.exports = router;
