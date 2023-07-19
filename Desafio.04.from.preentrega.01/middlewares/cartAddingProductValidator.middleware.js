const cartAddingProductValidatorMiddleware = async (req, res, next) => {
    const { cid, pid } = req.params;

    if (isNaN(cid) || isNaN(pid) || cid < 1 || pid < 1) {
        res.status(400).send({ "error": "inputs must be positive numbers" });
        return;     //  If I don't add this, I get this error on the server console: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`
    }

    next();
};

module.exports = cartAddingProductValidatorMiddleware;