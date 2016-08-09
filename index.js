/**
 * The JavaScript ArrayBuffer class
 * @external ArrayBuffer
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer}
 */
/**
 * The NodeJS HTTP library
 * @external http
 * @see {@link https://nodejs.org/api/http.html}
 */
/**
 * @class IncomingMessage
 * @memberof external:http
 * @see {@link https://nodejs.org/api/http.html#http_class_http_incomingmessage}
 */
/**
 * @class ServerResponse
 * @memberof external:http
 * @see {@link https://nodejs.org/api/http.html#http_class_http_serverresponse}
 */

module.exports = {};
for (let sbModule of ['config', 'io', 'structure-types']) {
	sbModule = require(__dirname + '/' + sbModule + '.js');
	for (let attribute in sbModule) module.exports[attribute] = sbModule[attribute];
}
module.exports.r = require(__dirname + '/read.js');