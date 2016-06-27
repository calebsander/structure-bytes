const assert = require(__dirname + '/lib/assert.js');

const VERSION = 1;
assert.between(0, VERSION, 65536);
const VERSION_BYTES = 2;
const VERSION_BUFFER = Buffer.allocUnsafe(VERSION_BYTES);
VERSION_BUFFER.writeUInt16BE(VERSION, 0);
const VERSION_STRING = VERSION_BUFFER.toString('base64');

module.exports = {
	VERSION_STRING
};