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
	writeType({type, outStream}) {
		assert.instanceOf(type, t.Type);
		assert.instanceOf(outStream, [stream.Writable, stream.Duplex]);
		return new BufferStream(type.toBuffer()).pipe(outStream).on('error', close).on('finish', function() {
			this.emit('sb-written');
		});
	},
	writeValue({type, value, outStream}) {
		assert.instanceOf(type, t.Type);
		assert.instanceOf(outStream, [stream.Writable, stream.Duplex]);
		const valueBuffer = new GrowableBuffer;
		type.writeValue(valueBuffer, value);
		return new BufferStream(valueBuffer).pipe(outStream).on('error', close).on('finish', function() {
			this.emit('sb-written');
		});
	},
	writeTypeAndValue({type, value, outStream}) {
		assert.instanceOf(type, t.Type);
		assert.instanceOf(outStream, [stream.Writable, stream.Duplex]);
		const typeStream = new BufferStream(type.toBuffer());
		typeStream.pipe(outStream, {end: false}).on('error', close);
		typeStream.on('bs-written', () => { //can't listen for finish because it isn't called on a pipe without an end
			io.writeValue({type, value, outStream});
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
			try { type = r.type(buffer, false) }
			catch (e) { callback(e, null) }
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
			try { value = r.value({buffer, type}) }
			catch (e) { callback(e, null) }
			if (value) callback(null, value);
		});
	},
	readTypeAndValue(inStream, callback) {
		assert.instanceOf(inStream, stream.Readable);
		assert.instanceOf(callback, Function);
		const segments = [];
		inStream.on('data', (chunk) => segments.push(chunk));
		inStream.on('error', close).on('error', (err) => callback(err, null));
		inStream.on('end', () => {
			const buffer = Buffer.concat(segments);
			let type;
			try { type = r._consumeType(buffer, 0) }
			catch (e) { callback(e, null) }
			if (type) {
				let value;
				try { value = r.value({buffer, offset: type.length, type: type.value})}
				catch (e) { callback(e, null) }
				if (value) callback(null, value);
			}
		});
	},
	httpRespond({req, res, type, value}) {
		assert.instanceOf(type, t.Type);
		res.setHeader('Content-Type', 'application/octet-stream');
		res.setHeader('Content-Encoding', 'gzip');
		res.setHeader('sig', type.getSignature());
		const outStream = zlib.createGzip();
		if (req.headers.sig && req.headers.sig === type.getSignature()) io.writeValue({type, value, outStream});
		else io.writeTypeAndValue({type, value, outStream});
		outStream.pipe(res);
	}
};