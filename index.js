/**
 * The JavaScript ArrayBuffer class
 * @external ArrayBuffer
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer}
 */
/**
 * The JavaScript Date class
 * @external Date
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date}
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

//Copy version string, io functions, and types into package exports
for (const moduleName of ['io', 'structure-types']) {
	const sbModule = require(__dirname + '/' + moduleName + '.js')
	for (const attribute in sbModule) exports[attribute] = sbModule[attribute] //eslint-disable-line guard-for-in
}
exports.r = require(__dirname + '/read.js') //add r. to read functions because type() and value() would be confusing
delete exports.MILLIS_PER_DAY
delete exports.MILLIS_PER_MINUTE
delete exports.REPEATED_TYPE