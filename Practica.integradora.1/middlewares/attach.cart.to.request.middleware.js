const cartModel = require('../dao/models/cart.model');

attachCartToRequestMiddleware = async (req, res, next) => {
    const user = req.user;
    if (user) {
        const cart = await cartModel.findOne({ user: user._id });
        req.cart = cart;
    }
    next();
};

module.exports = attachCartToRequestMiddleware;