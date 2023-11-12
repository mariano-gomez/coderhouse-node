const { Router } = require('express');
const UsersApiController = require('../../controllers/api/users.controller');
const { attachedFiles } = require('../../utils/multer.utils');

const router = Router();

router.get('/current', UsersApiController.currentUser);

router.put('/premium/:uid', UsersApiController.swapUserRole);

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

module.exports = router;