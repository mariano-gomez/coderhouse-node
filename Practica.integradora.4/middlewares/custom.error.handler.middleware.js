const CustomError = require('../utils/custom.error.utils');

const customErrorHandlerMiddleware = (error, req, res, next) => {

    if (error instanceof CustomError) {
        switch (error.type) {
            case CustomError.ERROR_TYPES.INPUT_ERROR:
                req.logger.warning(error.message);
                res.status(error.status).send({ status: "error", error: error.message, type: 'INPUT_ERROR' });
                break;
            case CustomError.ERROR_TYPES.ROUTING_ERROR:
                req.logger.http(error.message);
                res.status(error.status).send({ status: "error", error: error.message, type: 'ROUTING_ERROR' });
                break;
            case CustomError.ERROR_TYPES.DATABASE_ERROR:
                req.logger.error(error.message);
                res.status(error.status).send({ status: "error", error: error.message, type: 'DATABASE_ERROR' });
                break;
            case CustomError.ERROR_TYPES.PERMISSION_ERROR:
                req.logger.error(error.message);
                res.status(error.status).send({ status: "error", error: error.message, type: 'PERMISSION_ERROR' });
                break;
            default:
                req.logger.error(error.message);
                res.status(error.status).send({ status: "error", error: "Unhandled error", type: 'CustomError' });
        }
    } else {
        req.logger.error(error.message);
        res.status(500).send({ status: "error", error: error.message, type: 'DefaultError' });
    }
};

module.exports = customErrorHandlerMiddleware;