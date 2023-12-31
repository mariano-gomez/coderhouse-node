const { Router } = require('express');
const UsersApiController = require('../../controllers/api/users.controller');
const { attachedFiles } = require('../../utils/multer.utils');
const authorizeRole = require("../../middlewares/auth/authorize.role.api.middleware");

const router = Router();

router.get('/current', UsersApiController.currentUser);

router.put('/premium/:uid', UsersApiController.swapUserRole);

router.put('/:uid/changeRole',
    authorizeRole(['admin']),
    UsersApiController.changeUserRole
);

router.put('/:uid/documents',
    attachedFiles.fields([
        { name: 'id' },
        { name: 'address' },
        { name: 'accountState' },
        { name: 'products' },
        { name: 'others' }
    ]),
    UsersApiController.uploadDocuments
);

router.get('/',
    authorizeRole(['admin']),
    UsersApiController.listUsers
);

router.delete('/',
    authorizeRole(['admin']),
    UsersApiController.removeUsersInactiveSince
);

router.delete('/:uid',
    authorizeRole(['admin']),
    UsersApiController.deleteUser
);

module.exports = router;