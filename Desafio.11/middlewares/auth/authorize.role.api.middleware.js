function authorizeRole(authorizedRoles) {
    return (req, res, next) => {
        if (!Array.isArray(authorizedRoles)) {
            res.status(403).send({ error: `User don't have required role` });
            return;
        }
        if (!req.user) {
            console.log('ERROR 403')
            res.status(403).send({ error: `User not logged` });
            return;
        }
        if (authorizedRoles.findIndex(authRole => authRole == req.user.role) >= 0) {
            next();
            return;
        }
        res.status(403).send({ error: `User don't have required role` });
    };
}

module.exports = authorizeRole;
