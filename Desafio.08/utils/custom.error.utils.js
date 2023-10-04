class CustomError extends Error {

    static ERROR_TYPES = {
        ROUTING_ERROR: 1,
        DATABASE_ERROR: 2,
        INPUT_ERROR: 3,
        UNKNOWN_ERROR: 99,
    };

    constructor(message, type, status) {
        super(message);

        this.type = (type == undefined) ? CustomError.ERROR_TYPES.INPUT_ERROR : type;
        this.status = (status == undefined) ? 500 : status;
    }
}

module.exports = CustomError;