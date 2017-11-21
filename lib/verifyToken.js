var jwt = require('jsonwebtoken');

module.exports = function(req,res,next) {
    //assign token values from body or query string or header
 /* var token = req.body.token || req.query.token || req.headers['x-access-token'];*/
  var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
    // verifies secret and checks exp
        jwt.verify(token, global.config.jwt_secret, function(err, decoded) {
            if (err) { //failed verification.
                //return res.json({"error": true});
                return res.json({"error": "verification failed"});
            }
            req.decoded = decoded;
            next(); //no error, proceed
        });
    } else {
        // forbidden without token
        return res.status(403).send({
            //"error": true
            "error": "acess forbidden"
        });
    }
}