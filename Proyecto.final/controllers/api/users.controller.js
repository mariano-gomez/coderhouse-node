const crypto = require('crypto');

const factoryDAO = require('../../dao/factory.dao');
const userManager = factoryDAO.getInstance('user');

const UserDto = require('../../dao/dto/user.dto');
const CustomError = require("../../utils/custom.error.utils");
const { renameFile } = require('../../utils/multer.utils');

//  With sessions
class UsersApiController {

    static DELETE_USERS_INACTIVE_SINCE = 3 * 24 * 60 * 60 * 1000;

    static currentUser = (req, res) => {
        res.send(UserDto.parse(req.user));
    }

    static listUsers = async (req, res) => {
        const dbUsers = await userManager.getAll();
        const users = dbUsers.map(dbUser => UserDto.parseBasicData(dbUser));
        res.send({ 'status': 'success', 'payload': users });
    }

    static removeUsersInactiveSince = async (req, res, next) => {
        let result;
        try {
            result = await userManager.removeUsersInactiveSince(this.DELETE_USERS_INACTIVE_SINCE);
        } catch (e) {
            return next(e);
        }
        res.send({ 'status': 'success', 'payload': { deletedCount: result } });
    }
    static deleteUser = async (req, res) => {
        const { uid } = req.params;

        if (!await userManager.getById(uid)) {
            res.sendStatus(404);
            return;
        }

        await userManager.delete(uid);

        res.sendStatus(204);
    };

    static swapUserRole = async (req, res, next) => {
        const { uid } = req.params;
        const user = await userManager.getById(uid);

        if (user.role == 'admin') {
            return next(new CustomError(`the role of this user can't be changed`, CustomError.ERROR_TYPES.DATABASE_ERROR, 405));
        }

        if (!userManager.userHasUploadedRequiredDocuments(user)) {
            return next(
                new CustomError(
                    `A este usuario le falta subir al menos uno de los siguientes documentos: 'id', 'address', 'accountState'.`,
                    CustomError.ERROR_TYPES.PERMISSION_ERROR,
                    403
                )
            );
        } else {
            const newRole = (user.role == 'user') ? 'premium' : 'user'
            await userManager.save(uid, { role: newRole});
        }
        const updatedUser = await userManager.getById(uid);
        res.send(UserDto.parse(updatedUser));
    }

    static uploadDocuments = async (req, res, next) => {
        const { uid } = req.params;

        try {
            const user = await userManager.getById(uid);
        } catch (e) {
            next(new CustomError(e.message));
        }

        if (req.files == undefined) {
            return next(new CustomError(
                'No se encontraron documentos adjuntos en el cuerpo de la petición',
                CustomError.ERROR_TYPES.INPUT_ERROR
            ));
        }

        try {
            if (req.files['id']) {
                const filePath = await renameFile(req.files['id'][0], 'id', uid);
                await userManager.saveDocument(uid, {name: 'id', reference: filePath});
            }

            if (req.files['address']) {
                const filePath = await renameFile(req.files['address'][0], 'address', uid);
                await userManager.saveDocument(uid, {name: 'address', reference: filePath});
            }

            if (req.files['accountState']) {
                const filePath = await renameFile(req.files['accountState'][0], 'accountState', uid);
                await userManager.saveDocument(uid, {name: 'accountState', reference: filePath});
            }

            if (req.files['products']) {
                for (let file of req.files['products']) {
                    const filePath = await renameFile(file, `product`, crypto.randomUUID());
                    await userManager.saveDocument(uid, {name: 'products', reference: filePath});
                    console.log('PRODUCT', file);
                }
            }

            if (req.files['others']) {
                for (let file of req.files['others']) {
                    const filePath = await renameFile(file, `document`, crypto.randomUUID());
                    await userManager.saveDocument(uid, {name: 'documents', reference: filePath});
                    console.log('PRODUCT', file);
                }
            }
        } catch (e) {
            return next(e);
        }

        const updatedUser = await userManager.getById(uid);

        res.send({
            status: `success`,
            payload: `This user has ${updatedUser.documents.length} documents`
        });
    }
}

module.exports = UsersApiController;