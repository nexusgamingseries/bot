const token = require('../token-file');

function authorize(req, res, next) {

    if (req.body.secret == token.secret) {
        next();
    } else {
        res.status(401).send('Unauthorized.');
    }
}

module.exports = authorize;