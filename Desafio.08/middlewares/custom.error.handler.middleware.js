const CustomError = require('../utils/custom.error.utils');

const customErrorHandlerMiddleware = (error, req, res, next) => {

    if (error instanceof CustomError) {
        switch (error.type) {
            case CustomError.ERROR_TYPES.ROUTING_ERROR:
            case CustomError.ERROR_TYPES.DATABASE_ERROR:
            case CustomError.ERROR_TYPES.INPUT_ERROR:
                res.status(error.status).send({ status: "error", error: error.message, type: 'CustomError' });
                break;
            default:
                res.status(error.status).send({ status: "error", error: "Unhandled error", type: 'CustomError' });
        }
    } else {
        res.status(500).send({ status: "error", error: error.message, type: 'DefaultError' });
    }
};

module.exports = customErrorHandlerMiddleware;