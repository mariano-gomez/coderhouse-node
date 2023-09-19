
class SessionsApiController {

    static currentUser = (req, res) => {
        res.send(req.user);
    }
}

module.exports = SessionsApiController;