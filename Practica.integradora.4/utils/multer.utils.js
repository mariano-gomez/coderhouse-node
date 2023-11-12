const path = require('path');
const multer = require('multer');
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder;
        switch (file.fieldname) {
            case 'id':
            case 'address':
            case 'accountState':
                folder = 'profiles';
                break;
            case 'products':
                folder = 'products';
                break;
            default:
                folder = 'documents';
        }
        cb(null, path.join(__dirname, `../storage/${folder}`));
    },
});

/**
 * @param file | is an object like:
 * {
 *     fieldname: 'form-input-name',
 *     originalname: 'somefile.jpg',
 *     encoding: '7bit',
 *     mimetype: 'image/jpeg',
 *     destination: '/absolute/path/to/file/without/file/name',
 *     filename: '38d3fc5086cb2ba3714d77ac85a39d20',
 *     path: '/absolute/path/to/file/including/file/name',
 *     size: 4553
 *   }
 * @param prefix
 * @param uniqueId | Ideally, for unique files (`id`, `address` and `accountState`), you should use the `userId`
 * @returns {Promise<void>}
 */
const renameFile = async (file, prefix, uniqueId) => {
    const extensionSeparatorIndex = file.originalname.lastIndexOf('.');
    const extension = (extensionSeparatorIndex < 0) ? '' : file.originalname.substring(extensionSeparatorIndex + 1);
    const newPath = file.path.replace(
        file.filename,
        `${prefix}-${uniqueId}.${extension}`
    );
    await fs.renameSync(
        file.path,
        newPath,
    );
    return newPath;
};

module.exports = {
    attachedFiles: multer({ storage }),
    renameFile
}
