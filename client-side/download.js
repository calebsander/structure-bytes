(() => {
	if (window.sb === undefined) window.sb = require('/structure-types.js');
	else if (!(window.sb instanceof Object)) throw new Error('window.sb is already defined');
	const assert = require('/lib/assert.js');
	assert.instanceOf(window.Map, Function);
	assert.instanceOf(window.Set, Function);
	assert.instanceOf(window.ArrayBuffer, Function);
	assert.instanceOf(window.Uint8Array, Function);
	assert.instanceOf(window.Symbol, Function);
	require('/client-side/binary-ajax.js');
	const BufferStream = require('/lib/buffer-stream.js');
	const GrowableBuffer = require('/lib/growable-buffer.js');
	const io = require('/io.js');
	const r = require('/read.js');
	const BASE_64 = 'base64';
	const typeCache = {};
	function saveTypeCache() {
		const composedCache = {};
		for (let type in typeCache) {
			composedCache[type] = {
				sig: typeCache[type].sig,
				type: typeCache[type].type.toBuffer().toString(BASE_64)
			};
		}
		localStorage.typeCache = JSON.stringify(composedCache);
	}
	if (localStorage.typeCache === undefined) saveTypeCache();
	else {
		const composedCache = JSON.parse(localStorage.typeCache);
		for (let typeName in composedCache) {
			typeCache[typeName] = {
				sig: composedCache[typeName].sig,
				type: r.type(Buffer.from(composedCache[typeName].type, BASE_64))
			};
		}
	}
	window.sb.download = (typeName, options) => {
		assert.instanceOf(typeName, String);
		assert.instanceOf(options, Object);
		options.processData = false;
		options.dataType = 'arraybuffer';
		let typeInCache = false;
		if (typeCache[typeName]) {
			typeInCache = true;
			if (!options.headers) options.headers = {};
			options.headers.sig = typeCache[typeName].sig;
		}
		let oldSuccess = options.success;
		function success(value, textStatus, jqXHR) {
			if (oldSuccess) {
				if (!(oldSuccess instanceof Array)) oldSuccess = [oldSuccess];
				for (let success of oldSuccess) success(value, textStatus, jqXHR);
			}
		}
		options.success = (data, textStatus, jqXHR) => {
			data = Buffer.from(data);
			const inStream = new BufferStream(data);
			const sig = jqXHR.getResponseHeader('sig');
			if (typeInCache && typeCache[typeName].sig === sig) {
				const type = typeCache[typeName].type;
				io.readValue({inStream, type}, (err, value) => {
					if (err) throw err;
					success(value, textStatus, jqXHR);
				});
			}
			else {
				io.readType(inStream, (err, type) => {
					if (err) throw err;
					const inStream = new BufferStream(data)
					io.readTypeAndValue(inStream, (err, value) => {
						if (err) throw err;
						typeCache[typeName] = {sig, type};
						saveTypeCache();
						success(value, textStatus, jqXHR);
					});
				});
			}
		};
		$.ajax(options);
	};
})();