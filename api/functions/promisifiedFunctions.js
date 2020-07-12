const jwt = require('jsonwebtoken');
let { promisify } = require('util');

module.exports = {
	"verify": promisify(jwt.verify)
}