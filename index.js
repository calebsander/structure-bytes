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
//Copy version string, io functions, and types into package exports
for (const moduleName of ['config', 'io', 'structure-types']) {
	const sbModule = require(__dirname + '/' + moduleName + '.js');
	for (const attribute in sbModule) module.exports[attribute] = sbModule[attribute];
}
module.exports.r = require(__dirname + '/read.js'); //add r. to read functions because type() and value() would be confusing