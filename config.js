//For use with browserify
if (__dirname === '/') __dirname = '';

const assert = require(__dirname + '/lib/assert.js');
const base64 = require('base64-js');

const VERSION = 7;
assert.between(0, VERSION, 65536);
const VERSION_BYTES = 2;
const VERSION_BUFFER = new ArrayBuffer(VERSION_BYTES);
new DataView(VERSION_BUFFER).setUint16(0, VERSION);
const VERSION_STRING = base64.fromByteArray(new Uint8Array(VERSION_BUFFER));

module.exports = {
	VERSION_STRING
};