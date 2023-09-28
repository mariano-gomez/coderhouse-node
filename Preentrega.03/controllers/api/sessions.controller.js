const UserDto = require('../../dao/dto/user.dto');

class SessionsApiController {

    static currentUser = (req, res) => {
        res.send(UserDto.parse(req.user));
    }
}

module.exports = SessionsApiController;