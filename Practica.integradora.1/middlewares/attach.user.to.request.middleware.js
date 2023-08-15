const userModel = require('../dao/models/user.model');

attachUserToRequestMiddleware = async (req, res, next) => {
    let user = await userModel.findOne();
    if (!user) {
        user = await userModel.create({
            firstname: 'Mariano',
            lastname: 'Gomez',
            email: 'marianogomez@gmail.com',
            password: 'myPassword',
            role: 'admin',
        });
    }
    req.user = user;

    next();
};

module.exports = attachUserToRequestMiddleware;