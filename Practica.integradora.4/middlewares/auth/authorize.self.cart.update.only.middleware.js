function authorizeSelfCartUpdateOnly(req, res, next) {
    const { cid } = req.params;
    if (req.user?.cart?._id == cid) {
        next();
        return;
    }
    res.status(403).send({ error: `You can only update your cart` });
}

module.exports = authorizeSelfCartUpdateOnly;