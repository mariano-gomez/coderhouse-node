const dependencyContainer = require("../dependency.injection");
const logger = dependencyContainer.get('logger');

const loggerMiddleware = (req, res, next) => {
    req.logger = logger;
    next();
};

module.exports = loggerMiddleware;