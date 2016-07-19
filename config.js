//For use with browserify
if (__dirname === '/') __dirname = '';

const assert = require(__dirname + '/lib/assert.js');

const VERSION = 5;
assert.between(0, VERSION, 65536);
const VERSION_BYTES = 2;
const VERSION_BUFFER = Buffer.allocUnsafe(VERSION_BYTES);
VERSION_BUFFER.writeUInt16BE(VERSION, 0);
const VERSION_STRING = VERSION_BUFFER.toString('base64');

module.exports = {
	VERSION_STRING
};