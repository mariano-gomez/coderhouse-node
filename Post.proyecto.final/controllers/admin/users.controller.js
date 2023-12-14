const UserDTO = require("../../dao/dto/user.dto");

class UsersController {

    static listUsersPage = (req, res) => {
        res.render('admin/listUsers', {
            layout: 'adminLayout',
            user: UserDTO.parse(req.user),
        });
    };
}

module.exports = UsersController;