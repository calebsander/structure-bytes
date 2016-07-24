//For use with browserify
if (__dirname === '/') __dirname = '';

const assert = require(__dirname + '/lib/assert.js');
const BufferStream = require(__dirname + '/lib/buffer-stream.js');
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');
const r = require(__dirname + '/read.js');
const stream = require('stream');
const t = require(__dirname + '/structure-types.js');
const zlib = require('zlib');

const io = module.exports = {
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
	 */
	writeType({type, outStream}, callback) {
		assert.instanceOf(type, t.Type);
		assert.instanceOf(outStream, [stream.Writable, stream.Duplex]);
		if (callback === undefined) callback = () => {};
		assert.instanceOf(callback, Function);
		const typeStream = new BufferStream(type.toBuffer());
		return typeStream.pipe(outStream).on('error', function(err) {
			this.end();
			callback(err);
		}).on('finish', () => callback(null));
	},
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
	 */
	writeValue({type, value, outStream}, callback) {
		assert.instanceOf(type, t.Type);
		assert.instanceOf(outStream, [stream.Writable, stream.Duplex]);
		if (callback === undefined) callback = () => {};
		assert.instanceOf(callback, Function);
		const valueBuffer = new GrowableBuffer;
		type.writeValue(valueBuffer, value);
		return new BufferStream(valueBuffer).pipe(outStream).on('error', function(err) {
			this.end();
			callback(err);
		}).on('finish', () => callback(null));
	},
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
	 */
	writeTypeAndValue({type, value, outStream}, callback) {
		assert.instanceOf(type, t.Type);
		assert.instanceOf(outStream, [stream.Writable, stream.Duplex]);
		if (callback === undefined) callback = () => {};
		assert.instanceOf(callback, Function);
		const typeStream = new BufferStream(type.toBuffer());
		typeStream.pipe(outStream, {end: false}).on('error', function() {
			this.end();
		});
		typeStream.on('bs-written', () => { //can't listen for finish because it isn't called on a pipe without an end
			io.writeValue({type, value, outStream}, callback);
		});
		return outStream;
	},
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
	readType(inStream, callback) {
		assert.instanceOf(inStream, stream.Readable);
		assert.instanceOf(callback, Function);
		const segments = [];
		inStream.on('data', (chunk) => segments.push(chunk));
		inStream.on('error', function(err) {
			this.destroy();
			callback(err, null);
		});
		inStream.on('end', () => {
			const buffer = Buffer.concat(segments);
			let type;
			try { type = r.type(buffer, false) } //eslint-disable-line semi
			catch (e) { callback(e, null) } //eslint-disable-line semi
			if (type) callback(null, type);
		});
	},
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
	readValue({type, inStream}, callback) {
		assert.instanceOf(inStream, stream.Readable);
		assert.instanceOf(callback, Function);
		const segments = [];
		inStream.on('data', (chunk) => segments.push(chunk));
		inStream.on('error', function(err) {
			this.destroy();
			callback(err, null);
		});
		inStream.on('end', () => {
			const buffer = Buffer.concat(segments);
			let value;
			try { value = r.value({buffer, type}) } //eslint-disable-line semi
			catch (e) { callback(e, null) } //eslint-disable-line semi
			if (value) callback(null, value);
		});
	},
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
	readTypeAndValue(inStream, callback) {
		assert.instanceOf(inStream, stream.Readable);
		assert.instanceOf(callback, Function);
		const segments = [];
		inStream.on('data', (chunk) => segments.push(chunk));
		inStream.on('error', function(err) {
			this.destroy();
			callback(err, null, null);
		});
		inStream.on('end', () => {
			const buffer = Buffer.concat(segments);
			let type;
			try { type = r._consumeType(buffer, 0) } //eslint-disable-line semi
			catch (e) { callback(e, null, null) } //eslint-disable-line semi
			if (type) {
				let value;
				try { value = r.value({buffer, offset: type.length, type: type.value}) } //eslint-disable-line semi
				catch (e) { callback(e, null, null) } //eslint-disable-line semi
				if (value) callback(null, type.value, value);
			}
		});
	},
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
	 * @param {external:http.ServerResponse} params.res The server response
	 * @param {Type} params.type The type of the message
	 * @param {type} params.value The value to send
	 * @param {errCallback} callback
	 */
	httpRespond({req, res, type, value}, callback) {
		assert.instanceOf(type, t.Type);
		if (callback === undefined) callback = () => {};
		assert.instanceOf(callback, Function);
		try {
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader('Content-Encoding', 'gzip');
			res.setHeader('sig', type.getSignature());
			const outStream = zlib.createGzip(); //eslint-disable-line no-undef
			if (req.headers.sig && req.headers.sig === type.getSignature()) io.writeValue({type, value, outStream}, (err) => {
				if (err) callback(err);
			});
			else io.writeTypeAndValue({type, value, outStream}, (err) => {
				if (err) callback(err);
			});
			outStream.pipe(res).on('finish', () => callback(null));
		}
		catch (err) { callback(err) }
	}
};