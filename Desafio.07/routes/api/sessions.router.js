const { Router } = require('express');

const router = Router();

router.get('/current', (req, res) => {
    res.send(req.user);
});

module.exports = router;