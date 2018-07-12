"use strict";
//This file contains functions for performing I/O;
//specifically, reads and writes of types and values and HTTP responses
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const stream_1 = require("stream");
const util_1 = require("util");
const zlib = require("zlib");
const accepts = require("accepts");
const appendable_stream_1 = require("./lib/appendable-stream");
const assert_1 = require("./lib/assert");
const r = require("./read");
const abstract_1 = require("./types/abstract");
function toArrayBuffer(buffer) {
    const { buffer: arrayBuffer, byteOffset, byteLength } = buffer;
    return !byteOffset && byteLength === arrayBuffer.byteLength
        ? arrayBuffer // if Buffer occupies whole ArrayBuffer, no need to slice it
        : arrayBuffer.slice(byteOffset, byteOffset + byteLength);
}
/**
 * Writes the contents of `type.toBuffer()` ([[Type.toBuffer]])
 * to a writable stream and then closes the stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.writeType({
 *   type: new sb.StructType({
 *     abc: new sb.ArrayType(new sb.StringType),
 *     def: new sb.DateType
 *   }),
 *   outStream: fs.createWriteStream('out.sbt')
 * }, err => {
 *   if (err) throw err
 *   console.log('Done')
 * })
 *
 * //As a Promise:
 * util.promisify(sb.writeType)({
 *   type: new sb.StructType({
 *     abc: new sb.ArrayType(new sb.StringType),
 *     def: new sb.DateType
 *   }),
 *   outStream: fs.createWriteStream('out.sbt')
 * })
 *   .then(_ => console.log('Done'))
 * ````
 *
 * @param type The type to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
function writeType({ type, outStream }, callback) {
    assert_1.default.instanceOf(type, abstract_1.default);
    if (callback === undefined)
        callback = _ => { };
    assert_1.default.instanceOf(callback, Function);
    let error = null;
    outStream
        .on('error', callback)
        .on('finish', () => callback(error));
    const typeStream = new appendable_stream_1.default(outStream);
    try {
        type.addToBuffer(typeStream);
    }
    catch (err) {
        error = err;
    }
    outStream.end();
    return outStream;
}
exports.writeType = writeType;
/**
 * Writes the contents of `type.valueBuffer(value)` ([[Type.valueBuffer]])
 * to a writable stream and then closes the stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.writeValue({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbv')
 * }, err => {
 *   if (err) throw err
 *   console.log('Done')
 * })
 *
 * //As a Promise:
 * util.promisify(sb.writeValue)({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbv')
 * })
 *   .then(_ => console.log('Done'))
 * ````
 *
 * @param E The type of value being written
 * @param type The type to use to write the value
 * @param value The value to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
function writeValue({ type, value, outStream }, callback) {
    assert_1.default.instanceOf(type, abstract_1.default);
    if (callback === undefined)
        callback = _ => { };
    assert_1.default.instanceOf(callback, Function);
    let error = null;
    outStream
        .on('error', callback)
        .on('finish', () => callback(error));
    const valueStream = new appendable_stream_1.default(outStream);
    try {
        type.writeValue(valueStream, value);
    }
    catch (err) {
        error = err;
    }
    outStream.end();
    return outStream;
}
exports.writeValue = writeValue;
/**
 * Writes the contents of `type.toBuffer()` ([[Type.toBuffer]]),
 * followed by the contents of `type.valueBuffer(value)` ([[Type.valueBuffer]]),
 * to a writable stream and then closes the stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.writeTypeAndValue({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbtv')
 * }, err => {
 *   if (err) throw err
 *   console.log('Done')
 * })
 *
 * //As a Promise:
 * util.promisify(sb.writeTypeAndValue)({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbtv')
 * })
 *   .then(_ => console.log('Done'))
 * ````
 *
 * @param E The type of value being written
 * @param type The type to write and to use to write the value
 * @param value The value to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
function writeTypeAndValue({ type, value, outStream }, callback) {
    assert_1.default.instanceOf(type, abstract_1.default);
    if (callback === undefined)
        callback = _ => { };
    assert_1.default.instanceOf(callback, Function);
    let error = null;
    outStream
        .on('error', callback)
        .on('finish', () => callback(error));
    const typeValueStream = new appendable_stream_1.default(outStream);
    try {
        type.addToBuffer(typeValueStream);
        type.writeValue(typeValueStream, value);
    }
    catch (err) {
        error = err;
    }
    outStream.end();
    return outStream;
}
exports.writeTypeAndValue = writeTypeAndValue;
/**
 * Reads a type from a readable stream.
 * This should be used when reading from sources
 * written to by [[writeType]].
 * Calls `callback` with the type when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.readType(fs.createReadStream('out.sbt'), (err, type) => {
 *   if (err) throw err
 *   console.log(type)
 * })
 *
 * //As a Promise:
 * util.promisify(sb.readType)(fs.createReadStream('out.sbt'))
 *   .then(type => console.log(type))
 * ````
 *
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
function readType(inStream, callback) {
    assert_1.default.instanceOf(inStream, stream_1.Readable);
    assert_1.default.instanceOf(callback, Function);
    const segments = [];
    inStream
        .on('data', chunk => segments.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk)))
        .on('error', function (err) {
        this.destroy();
        callback(err, null);
    })
        .on('end', () => {
        const buffer = Buffer.concat(segments);
        let type;
        try {
            type = r.type(toArrayBuffer(buffer), false);
        }
        catch (e) {
            return callback(e, null);
        }
        callback(null, type);
    });
}
exports.readType = readType;
/**
 * Reads a value from a readable stream.
 * The [[Type]] used to write the value bytes must be known.
 * This should be used when reading from sources
 * written to by [[writeValue]].
 * Calls `callback` with the value when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.readValue({
 *   type: new sb.FlexUnsignedIntType,
 *   inStream: fs.createReadStream('out.sbv')
 * }, (err, value) => {
 *   if (err) throw err
 *   console.log(value)
 * })
 *
 * //As a Promise:
 * util.promisify(sb.readValue)({
 *   type: new sb.FlexUnsignedIntType,
 *   inStream: fs.createReadStream('out.sbv')
 * })
 *   .then(value => console.log(value))
 * ````
 *
 * @param E The type of value being read
 * (must match the `VALUE` parameter of `type`)
 * @param type The [[Type]] (or an equivalent one) that wrote the value bytes
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
function readValue({ type, inStream }, callback) {
    assert_1.default.instanceOf(inStream, stream_1.Readable);
    assert_1.default.instanceOf(callback, Function);
    const segments = [];
    inStream
        .on('data', chunk => segments.push(chunk))
        .on('error', function (err) {
        this.destroy();
        callback(err, null);
    })
        .on('end', () => {
        const buffer = Buffer.concat(segments);
        let value;
        try {
            value = type.readValue(toArrayBuffer(buffer));
        }
        catch (e) {
            return callback(e, null);
        }
        callback(null, value);
    });
}
exports.readValue = readValue;
/**
 * Reads a type and a value from a readable stream.
 * This should be used when reading from sources
 * written to by [[writeTypeAndValue]].
 * Calls `callback` with the type and value when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.readTypeAndValue(fs.createReadStream('out.sbtv'), (err, type, value) => {
 *   if (err) throw err
 *   console.log(type, value)
 * })
 *
 * //As a Promise:
 * util.promisify(sb.readTypeAndValue)(fs.createReadStream('out.sbtv'))
 *   .then(({type, value}) => console.log(type, value))
 * ````
 *
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
function readTypeAndValue(inStream, callback) {
    assert_1.default.instanceOf(inStream, stream_1.Readable);
    assert_1.default.instanceOf(callback, Function);
    const segments = [];
    inStream
        .on('data', chunk => segments.push(chunk))
        .on('error', function (err) {
        this.destroy();
        callback(err, null, null);
    })
        .on('end', () => {
        const buffer = Buffer.concat(segments);
        let type;
        //Using consumeType() in order to get the length of the type (the start of the value)
        try {
            type = r._consumeType(toArrayBuffer(buffer), 0);
        }
        catch (e) {
            return callback(e, null, null);
        }
        let value;
        try {
            value = type.value.readValue(toArrayBuffer(buffer), type.length);
        }
        catch (e) {
            return callback(e, null, null);
        }
        callback(null, type.value, value);
    });
}
exports.readTypeAndValue = readTypeAndValue;
//Custom promisifiy function because Promise cannot resolve to 2 values
readTypeAndValue[util_1.promisify.custom] = (inStream) => new Promise((resolve, reject) => readTypeAndValue(inStream, (err, type, value) => {
    if (err)
        reject(err);
    else
        resolve({ type: type, value: value });
}));
/**
 * Responds to an HTTP(S) request for a value.
 * Will send both type and value if the `sig` header
 * doesn't match the type's signature.
 * Will only send the value if the signatures match.
 * Response is gzipped to decrease size, if client allows.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * sb.httpRespond({
 *   req,
 *   res,
 *   type: new sb.DateType
 *   value: new Date
 * })
 * ````
 *
 * @param req The client request
 * @param res The server response
 * @param type The [[Type]] to use to write the value
 * @param value The value to send
 * @param callback The optional callback to call when response ends
 */
function httpRespond({ req, res, type, value }, callback) {
    assert_1.default.instanceOf(type, abstract_1.default);
    if (callback === undefined)
        callback = _ => { };
    assert_1.default.instanceOf(callback, Function);
    assert_1.default.instanceOf(req, http.IncomingMessage);
    assert_1.default.instanceOf(res, http.OutgoingMessage);
    try {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('sig', type.getSignature());
        const acceptsGzip = accepts(req).encoding(['gzip']);
        let outStream;
        if (acceptsGzip) {
            res.setHeader('Content-Encoding', 'gzip');
            outStream = zlib.createGzip(); //pipe into a zip stream to decrease size of response
        }
        else
            outStream = res;
        function writeEndCallback(err) {
            if (err)
                callback(err);
            else if (!acceptsGzip)
                callback(null);
        }
        if (req.headers.sig && req.headers.sig === type.getSignature()) {
            writeValue({ type, value, outStream }, writeEndCallback);
        }
        else
            writeTypeAndValue({ type, value, outStream }, writeEndCallback); //otherwise, type and value need to be sent
        if (acceptsGzip) {
            outStream.pipe(res)
                .on('finish', () => callback(null));
        }
    }
    catch (err) {
        callback(err);
    }
}
exports.httpRespond = httpRespond;
