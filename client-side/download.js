/*eslint-env browser*/
(() => {
	require('/client-side/common.js');
	const assert = require('/lib/assert.js');
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
			const sig = jqXHR.getResponseHeader('sig');
			if (typeInCache && typeCache[typeName].sig === sig) {
				const type = typeCache[typeName].type;
				const value = r.value({buffer: data, type});
				success(value, textStatus, jqXHR);
			}
			else {
				const readType = r._consumeType(data, 0);
				const value = r.value({buffer: data, offset: readType.length, type: readType.value});
				const type = readType.value;
				typeCache[typeName] = {sig, type};
				saveTypeCache();
				success(value, textStatus, jqXHR);
			}
		};
		$.ajax(options); //eslint-disable-line no-undef
	};
})();