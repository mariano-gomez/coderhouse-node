const _dotenv = require('../config/config');

class FactoryDao {

    static getInstance(model) {
        let persistanceFile;
        switch (model) {
            case 'chat.message':
            case 'ticket':
                persistanceFile = ((_dotenv.PERSISTENCE != 'mongo') ? './filesystem/' :  './db/') + model + '.manager';
                break;
            default:
                persistanceFile = './db/' + model + '.manager';
                break;

        }
        const manager = require(persistanceFile);
        return manager;
    }
}

module.exports = FactoryDao;