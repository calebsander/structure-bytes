"use strict";
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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./io"));
const read = require("./read");
exports.r = read;
__export(require("./recursive-registry"));
__export(require("./types"));
