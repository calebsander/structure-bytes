"use strict";
//This file contains functions for performing I/O;
//specifically, reads and writes of types and values and HTTP responses
Object.defineProperty(exports, "__esModule", { value: true });
const accepts = require("accepts");
const assert_1 = require("./lib/assert");
const buffer_stream_1 = require("./lib/buffer-stream");
const growable_buffer_1 = require("./lib/growable-buffer");
const http = require("http");
const r = require("./read");
const stream_1 = require("stream");
const structure_types_1 = require("./structure-types");
const zlib = require("zlib");
function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
const WRITABLE_STREAMS = [stream_1.Writable, stream_1.Duplex, http.OutgoingMessage];
/**
 * A callback that receives an error object, if any was thrown.
 * @callback errCallback
 * @param {null|Error} err The error (if any) that occurred
 */
/** @function
 * @name writeType
 * @desc Writes type bytes to a writable stream.
 * Writes the contents of [type.toBuffer()]{@link Type#toBuffer}
 * followed by a null byte.
 * Calls {@link callback} when done.
 * @param {{type, outStream}} params
 * @param {Type} params.type The type to write
 * @param {stream.Writable} params.outStream The stream to write to
 * @param {errCallback=} callback
 * @return {stream.Writable} {@link params.outStream}
 */
function writeType({ type, outStream }, callback) {
    assert_1.default.instanceOf(type, structure_types_1.AbstractType);
    assert_1.default.instanceOf(outStream, WRITABLE_STREAMS);
    if (callback === undefined)
        callback = () => { };
    assert_1.default.instanceOf(callback, Function);
    let typeBuffer;
    try {
        typeBuffer = type.toBuffer();
    }
    catch (err) {
        callback(err);
        return outStream;
    }
    const typeStream = new buffer_stream_1.default(typeBuffer);
    return typeStream.pipe(outStream)
        .on('error', function (err) {
        this.end();
        callback(err);
    })
        .on('finish', () => callback(null));
}
exports.writeType = writeType;
/** @function
 * @name writeValue
 * @desc Writes value bytes to a writable stream.
 * Writes the contents of [type.valueBuffer(value)]{@link Type#valueBuffer}
 * followed by a null byte.
 * Calls {@link callback} when done.
 * @param {{type, value, outStream}} params
 * @param {Type} params.type The type to use to write the value
 * @param {type} params.value The value to write
 * @param {stream.Writable} params.outStream The stream to write to
 * @param {errCallback=} callback
 * @return {stream.Writable} {@link params.outStream}
 */
function writeValue({ type, value, outStream }, callback) {
    assert_1.default.instanceOf(type, structure_types_1.AbstractType);
    assert_1.default.instanceOf(outStream, WRITABLE_STREAMS);
    if (callback === undefined)
        callback = () => { };
    assert_1.default.instanceOf(callback, Function);
    const valueBuffer = new growable_buffer_1.default;
    try {
        type.writeValue(valueBuffer, value);
    }
    catch (err) {
        callback(err);
        return outStream;
    }
    return new buffer_stream_1.default(valueBuffer).pipe(outStream)
        .on('error', function (err) {
        this.end();
        callback(err);
    })
        .on('finish', () => callback(null));
}
exports.writeValue = writeValue;
/** @function
 * @name writeTypeAndValue
 * @desc Writes both type and value bytes to a writable stream.
 * Writes the contents of [type.toBuffer()]{@link Type#toBuffer},
 * followed by the contents of [type.valueBuffer(value)]{@link Type#valueBuffer},
 * and then a null byte.
 * Calls {@link callback} when done.
 * @param {{type, value, outStream}} params
 * @param {Type} params.type The type to write
 * and to use to write the value
 * @param {type} params.value The value to write
 * @param {stream.Writable} params.outStream The stream to write to
 * @param {errCallback=} callback
 * @return {stream.Writable} {@link params.outStream}
 */
function writeTypeAndValue({ type, value, outStream }, callback) {
    assert_1.default.instanceOf(type, structure_types_1.AbstractType);
    assert_1.default.instanceOf(outStream, WRITABLE_STREAMS);
    if (callback === undefined)
        callback = () => { };
    assert_1.default.instanceOf(callback, Function);
    let typeBuffer;
    try {
        typeBuffer = type.toBuffer();
    }
    catch (err) {
        callback(err);
        return outStream;
    }
    const typeStream = new buffer_stream_1.default(typeBuffer);
    typeStream.pipe(outStream, { end: false })
        .on('error', function () {
        this.end();
    });
    typeStream.on('bs-written', () => {
        writeValue({ type, value, outStream }, callback);
    });
    return outStream;
}
exports.writeTypeAndValue = writeTypeAndValue;
/**
 * A callback that receives an error object, if any was thrown,
 * and a type, if no error was thrown.
 * @callback typeCallback
 * @param {null|Error} err The error (if any) that occurred
 * @param {null|Type} type The type that was read
 */
/** @function
 * @name readType
 * @desc Reads a type from a readable stream.
 * This should be used when reading from sources
 * written to by {@link writeType}.
 * Calls {@link callback} with the type when done.
 * @param {stream.Readable} inStream The stream to read from
 * @param {typeCallback} callback
 */
function readType(inStream, callback) {
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
        let type;
        try {
            type = r.type(toArrayBuffer(buffer), false);
        }
        catch (e) {
            return callback(e, null);
        }
        callback(null, type); //if error occurred, don't callback with a null type
    });
}
exports.readType = readType;
/**
 * A callback that receives an error object, if any was thrown,
 * and a value, if no error was thrown.
 * @callback valueCallback
 * @param {null|Error} err The error (if any) that occurred
 * @param {null|type} value The value that was read
 */
/** @function
 * @name readValue
 * @desc Reads a value from a readable stream.
 * The {@link Type} used to write the value bytes must be known.
 * This should be used when reading from sources
 * written to by {@link writeValue}.
 * Calls {@link callback} with the value when done.
 * @param {{type, inStream}} params
 * @param {Type} params.type The type that wrote the value bytes
 * @param {stream.Readable} params.inStream The stream to read from
 * @param {valueCallback} callback
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
            value = r.value({ buffer: toArrayBuffer(buffer), type });
        }
        catch (e) {
            return callback(e, null);
        }
        callback(null, value); //if error occurred, don't callback with a null value
    });
}
exports.readValue = readValue;
/**
 * A callback that receives an error object, if any was thrown,
 * and a type and value, if no error was thrown.
 * @callback typeAndValueCallback
 * @param {null|Error} err The error (if any) that occurred
 * @param {null|Type} type The type that was read
 * @param {null|type} value The value that was read
 */
/** @function
 * @name readTypeAndValue
 * @desc Reads a type and a value from a readable stream.
 * This should be used when reading from sources
 * written to by {@link writeTypeAndValue}.
 * Calls {@link callback} with the type and value when done.
 * @param {stream.Readable} inStream The stream to read from
 * @param {typeAndValueCallback} callback
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
            value = r.value({ buffer: toArrayBuffer(buffer), offset: type.length, type: type.value });
        }
        catch (e) {
            return callback(e, null, null);
        }
        callback(null, type.value, value); //if error occurred, don't callback with null value or type
    });
}
exports.readTypeAndValue = readTypeAndValue;
/** @function
 * @name httpRespond
 * @desc Responds to an HTTP(S) request for a value.
 * Will send both type and value if the {@link sig} header
 * doesn't match the type's signature.
 * Will only send the value if the signatures match.
 * Response is gzipped to decrease size.
 * Calls {@link callback} when done.
 * @param {{req, res, type, value}} params
 * @param {external:http.IncomingMessage} params.req The client request
 * @param {external:http.OutgoingMessage} params.res The server response
 * @param {Type} params.type The type of the message
 * @param {type} params.value The value to send
 * @param {errCallback=} callback
 */
function httpRespond({ req, res, type, value }, callback) {
    assert_1.default.instanceOf(type, structure_types_1.AbstractType);
    if (callback === undefined)
        callback = () => { };
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
