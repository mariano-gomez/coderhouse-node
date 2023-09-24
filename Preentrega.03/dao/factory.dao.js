const _dotenv = require('../config/config');

class FactoryDao {

    static getInstance(model) {
        let persistanceFile;

        switch (_dotenv.PERSISTENCE) {
            case `file`:
                //  TODO: finish with the implementation of filesystem managers (some methods still pending) and enable the following line
                // persistanceFile = './filesystem/' + model + '.manager';
                // break;
            case `mongo`:
            default:
                persistanceFile = './db/' + model + '.manager';
        }
        const manager = require(persistanceFile);
        return manager;
    }
}

module.exports = FactoryDao;