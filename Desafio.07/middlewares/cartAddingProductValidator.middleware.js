const cartAddingProductValidatorMiddleware = async (req, res, next) => {
    const { cid, pid } = req.params;

    if (!cid) {
        res.status(400).send({ "error": "cid (cart id) is required" });
        return;
    }

    if (!pid) {
        res.status(400).send({ "error": "pid (product id) is required" });
        return;
    }

    next();
};

module.exports = cartAddingProductValidatorMiddleware;