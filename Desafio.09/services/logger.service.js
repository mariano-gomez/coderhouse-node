const dependencyContainer = require('../dependency.injection');
const _dotenv = dependencyContainer.get('dotenv');

const {
    createLogger,
    transports: { Console, File },
    format: { combine, timestamp, printf, colorize, simple }
} = require('winston');

const loggerOptionsObject = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: 'red',
        error: 'yellow',
        warning: 'magenta',
        info: 'blue',
        http: 'cyan',
        debug: 'gray',
    }
};

if (_dotenv.ENV === 'production') {
    logger = createLogger({
        levels: loggerOptionsObject.levels,
        transports: [
            new Console({
                level: 'info'
            }),
            new File({
                filename: './logs/error.log',   //  If it doesn't exists, it is created
                level: 'info'
            })
        ],
        format: combine(
            timestamp(),
            printf(({ timestamp, level, message }) => {
                return `{ "timestamp": ${timestamp}, "level": "${level}": "message": "${message}" }`;
            })
        ),
        // ...loggerOptionsObject
    });
} else {
    logger = createLogger({
        levels: loggerOptionsObject.levels,
        transports: [
            new Console({
                level: 'debug'
            })
        ],
        format: combine(
            colorize({ colors: loggerOptionsObject.colors }),
            simple()
        ),
        // ...loggerOptionsObject
    });
}
module.exports = logger;