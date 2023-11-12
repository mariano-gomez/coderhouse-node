const factoryDAO = require('../../dao/factory.dao');
const userManager = factoryDAO.getInstance('user');

const UserDto = require('../../dao/dto/user.dto');
const CustomError = require("../../utils/custom.error.utils");

//  With sessions
class SessionsApiController {

    static currentUser = (req, res) => {
        res.send(UserDto.parse(req.user));
    }

    static swapUserRole = async (req, res, next) => {
        const { uid } = req.params;
        const user = await userManager.getById(uid);

        if (user.role == 'admin') {
            return next(new CustomError(`the role of this user can't be changed`, CustomError.ERROR_TYPES.DATABASE_ERROR, 405));
        } else {
            const newRole = (user.role == 'user') ? 'premium' : 'user'
            await userManager.save(uid, { role: newRole});
        }
        const updatedUser = await userManager.getById(uid);
        res.send(UserDto.parse(updatedUser));
    }

    static uploadDocuments = async (req, res, next) => {
        res.send({ok});
    }
}

module.exports = SessionsApiController;