const Router = require('express');

const router = Router();

//  This method is meant to provide a response for any other endpoint/url that doesn't exists
//  TODO: check what happens if i remove the '*' parameter)
router.all('*', (req, res) => {
    res.statusCode = 404;
    console.log(`An invalid url has been required`);
    res.send({ "Error": "The required URL doesn't exists" });
});

module.exports = router