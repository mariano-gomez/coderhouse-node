const { Router } = require('express');
const UserDTO = require("../../dao/dto/user.dto");

const router = Router();

router.get('/', (req, res) => {
    res.render('admin/listUsers', {
        layout: 'adminLayout',
        user: UserDTO.parse(req.user),
    });
});

module.exports = router;
