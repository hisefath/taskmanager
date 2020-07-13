const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
let { promisify } = require('util');

module.exports = {
	"verify": promisify(jwt.verify),
	"sign": promisify(jwt.sign),
	"randomBytes": promisify(crypto.randomBytes),
	"compare": promisify(bcrypt.compare),
	"hash": promisify(bcrypt.hash),
	"genSalt": promisify(bcrypt.genSalt)
}