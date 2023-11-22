const { Router } = require('express');

const adminUsersRoutes = require('./users.router');

const router = Router();

router.use('/users', adminUsersRoutes);

module.exports = router;
