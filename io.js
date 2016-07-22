//For use with browserify
if (__dirname === '/') __dirname = '';

const assert = require(__dirname + '/lib/assert.js');
const BufferStream = require(__dirname + '/lib/buffer-stream.js');
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');
const r = require(__dirname + '/read.js');
const stream = require('stream');
const t = require(__dirname + '/structure-types.js');
const zlib = require('zlib');

function close() {
	this.end();
}

const io = module.exports = {
	writeType({type, outStream}, callback) {
		assert.instanceOf(type, t.Type);
		assert.instanceOf(outStream, [stream.Writable, stream.Duplex]);
		if (callback === undefined) callback = () => {};
		assert.instanceOf(callback, Function);
		return new BufferStream(type.toBuffer()).pipe(outStream).on('error', function(err) {
			this.end();
			callback(err);
		}).on('finish', () => callback(null));
	},
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
	writeTypeAndValue({type, value, outStream}, callback) {
		assert.instanceOf(type, t.Type);
		assert.instanceOf(outStream, [stream.Writable, stream.Duplex]);
		if (callback === undefined) callback = () => {};
		assert.instanceOf(callback, Function);
		const typeStream = new BufferStream(type.toBuffer());
		typeStream.pipe(outStream, {end: false}).on('error', close);
		typeStream.on('bs-written', () => { //can't listen for finish because it isn't called on a pipe without an end
			io.writeValue({type, value, outStream}, callback);
		});
		return outStream;
	},
	readType(inStream, callback) {
		assert.instanceOf(inStream, stream.Readable);
		assert.instanceOf(callback, Function);
		const segments = [];
		inStream.on('data', (chunk) => segments.push(chunk));
		inStream.on('error', close).on('error', (err) => callback(err, null));
		inStream.on('end', () => {
			const buffer = Buffer.concat(segments);
			let type;
			try { type = r.type(buffer, false) } //eslint-disable-line semi
			catch (e) { callback(e, null) } //eslint-disable-line semi
			if (type) callback(null, type);
		});
	},
	readValue({inStream, type}, callback) {
		assert.instanceOf(inStream, stream.Readable);
		assert.instanceOf(callback, Function);
		const segments = [];
		inStream.on('data', (chunk) => segments.push(chunk));
		inStream.on('error', close).on('error', (err) => callback(err, null));
		inStream.on('end', () => {
			const buffer = Buffer.concat(segments);
			let value;
			try { value = r.value({buffer, type}) } //eslint-disable-line semi
			catch (e) { callback(e, null) } //eslint-disable-line semi
			if (value) callback(null, value);
		});
	},
	readTypeAndValue(inStream, callback) {
		assert.instanceOf(inStream, stream.Readable);
		assert.instanceOf(callback, Function);
		const segments = [];
		inStream.on('data', (chunk) => segments.push(chunk));
		inStream.on('error', close).on('error', (err) => callback(err, null, null));
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
	httpRespond({req, res, type, value}, callback) {
		assert.instanceOf(type, t.Type);
		if (callback === undefined) callback = () => {};
		assert.instanceOf(callback, Function);
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
		outStream.pipe(res).on('error', (err) => {
			this.close();
			callback(err);
		}).on('finish', () => callback(null));
	}
};