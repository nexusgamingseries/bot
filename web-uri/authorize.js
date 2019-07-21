const token = require('../token-file');

function authorize(req, res, next) {
    let secret = req.body.secret || req.query.secret;
    console.log('secret ', secret);
    if (secret == process.env.discordAPItoken) {
        next();
    } else {
        res.status(401).send('Unauthorized.');
    }
}

module.exports = authorize;