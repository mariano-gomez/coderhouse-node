const _dotenv = require('../config/config');

class FactoryDao {

    static getInstance(model) {
        const persistanceFile = ((_dotenv.PERSISTENCE != 'mongo') ? './filesystem/' :  './db/') + model + '.manager';
        const manager = require(persistanceFile);
        return manager;
    }
}

module.exports = FactoryDao;