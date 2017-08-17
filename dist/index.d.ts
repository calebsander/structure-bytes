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
export * from './io';
import * as read from './read';
export declare const r: typeof read;
export * from './recursive-registry';
export * from './structure-types';
