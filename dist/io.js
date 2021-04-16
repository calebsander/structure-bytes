"use strict";
//This file contains functions for performing I/O;
//specifically, reads and writes of types and values and HTTP responses
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRespond = exports.readTypeAndValue = exports.readValue = exports.readType = exports.writeTypeAndValue = exports.writeValue = exports.writeType = void 0;
const http = require("http");
const stream_1 = require("stream");
const util_1 = require("util");
const zlib = require("zlib");
const accepts = require("accepts");
const appendable_stream_1 = require("./lib/appendable-stream");
const assert = require("./lib/assert");
const growable_buffer_1 = require("./lib/growable-buffer");
const r = require("./read");
const abstract_1 = require("./types/abstract");
function concatStream(stream, callback) {
    const segments = [];
    stream
        .on('data', chunk => segments.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk)))
        .on('error', err => {
        stream.destroy();
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        callback(err, null);
    })
        .on('end', () => callback(null, growable_buffer_1.toArrayBuffer(Buffer.concat(segments))));
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
    assert.instanceOf(type, abstract_1.default);
    if (callback === undefined)
        callback = () => { };
    assert.instanceOf(callback, Function);
    let error = null;
    outStream
        .on('error', callback)
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .on('finish', () => callback(error));
    const typeStream = new appendable_stream_1.AppendableStream(outStream);
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
    assert.instanceOf(type, abstract_1.default);
    if (callback === undefined)
        callback = () => { };
    assert.instanceOf(callback, Function);
    let error = null;
    outStream
        .on('error', callback)
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .on('finish', () => callback(error));
    const valueStream = new appendable_stream_1.AppendableStream(outStream);
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
    assert.instanceOf(type, abstract_1.default);
    if (callback === undefined)
        callback = () => { };
    assert.instanceOf(callback, Function);
    let error = null;
    outStream
        .on('error', callback)
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .on('finish', () => callback(error));
    const typeValueStream = new appendable_stream_1.AppendableStream(outStream);
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
    assert.instanceOf(inStream, stream_1.Readable);
    assert.instanceOf(callback, Function);
    concatStream(inStream, (err, buffer) => {
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (err)
            return callback(err, null);
        let type;
        try {
            type = r.type(buffer, false);
        }
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    assert.instanceOf(inStream, stream_1.Readable);
    assert.instanceOf(callback, Function);
    concatStream(inStream, (err, buffer) => {
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (err)
            return callback(err, null);
        let value;
        try {
            value = type.readValue(buffer);
        }
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
exports.readTypeAndValue = ((inStream, callback) => {
    assert.instanceOf(inStream, stream_1.Readable);
    assert.instanceOf(callback, Function);
    concatStream(inStream, (err, buffer) => {
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (err)
            return callback(err, null, null);
        let type;
        //Using consumeType() in order to get the length of the type (the start of the value)
        try {
            type = r._consumeType(buffer, 0);
        }
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        catch (e) {
            return callback(e, null, null);
        }
        let value;
        try {
            value = type.value.readValue(buffer, type.length);
        }
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        catch (e) {
            return callback(e, null, null);
        }
        callback(null, type.value, value);
    });
});
//Custom promisifiy function because Promise cannot resolve to 2 values
exports.readTypeAndValue[util_1.promisify.custom] = (inStream) => new Promise((resolve, reject) => exports.readTypeAndValue(inStream, (err, type, value) => {
    if (err)
        reject(err);
    else
        resolve({ type, value });
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
    assert.instanceOf(type, abstract_1.default);
    if (callback === undefined)
        callback = () => { };
    assert.instanceOf(callback, Function);
    assert.instanceOf(req, http.IncomingMessage);
    assert.instanceOf(res, http.OutgoingMessage);
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
        const writeEndCallback = (err) => {
            //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (err)
                callback(err);
            //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            else if (!acceptsGzip)
                callback(null);
        };
        if (req.headers.sig && req.headers.sig === type.getSignature()) { //if client already has type, only value needs to be sent
            writeValue({ type, value, outStream }, writeEndCallback);
        }
        else
            writeTypeAndValue({ type, value, outStream }, writeEndCallback); //otherwise, type and value need to be sent
        if (acceptsGzip) { //don't pipe until writing begins
            outStream.pipe(res)
                //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                .on('finish', () => callback(null));
        }
    }
    catch (err) {
        callback(err);
    }
}
exports.httpRespond = httpRespond;
