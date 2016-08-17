/*eslint-env browser*/
(() => {
	require('/client-side/common.js');
	const assert = require('/lib/assert.js');
	const base64 = require('base64-js');
	const r = require('/read.js');
	const typeCache = {};
	function saveTypeCache() {
		const composedCache = {};
		for (const type in typeCache) {
			composedCache[type] = {
				sig: typeCache[type].sig,
				type: base64.fromByteArray(new Uint8Array(typeCache[type].type.toBuffer()))
			};
		}
		localStorage.typeCache = JSON.stringify(composedCache);
	}
	if (localStorage.typeCache === undefined) saveTypeCache();
	else {
		const composedCache = JSON.parse(localStorage.typeCache);
		for (const typeName in composedCache) {
			typeCache[typeName] = {
				sig: composedCache[typeName].sig,
				type: r.type(new Uint8Array(base64.toByteArray(composedCache[typeName].type)).buffer)
			};
		}
	}
	/** @function
	 * @name download
	 * @desc <b>(client-side only)</b>
	 * Downloads a value using an AJAX request.
	 * The type will be sent from the server if not in the client's cache.
	 * If the client has already cached the correct type, only the value will be sent.
	 * To use, include {@link compiled/download.js} or {@link compiled/upload-download.js}.
	 * @param {string} typeName An identifier for the type being downloaded.
	 * The downloaded type will be cached under this name
	 * and future requests that use the same {@link typeName}
	 * will try to use the type data cached in [localStorage]{@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}.
	 * To best utilize the cache,
	 * use different type names for requests of different types
	 * and use the same type name for requests of the same type.
	 * @param {Object} options [jQuery AJAX options]{@link https://api.jquery.com/jquery.ajax/#jQuery-ajax-settings}.
	 * These options should specify what URL to use, what to do on success, etc.
	 * {@link options.dataType} will be overwritten.
	 * @example
	 * sb.download('people', {
	 *   url: '/download-people',
	 *   type: 'GET',
	 *   success: function(response, textStatus, jqXHR) {
	 *     console.log(response); //e.g. [{name: 'John', id: 2}, {name: 'Jane', id: 10}]
	 *   }
	 * });
	 */
	window.sb.download = (typeName, options) => {
		assert.instanceOf(typeName, String);
		assert.instanceOf(options, Object);
		options.dataType = 'arraybuffer';
		let typeInCache;
		if (typeCache[typeName]) {
			typeInCache = true;
			if (!options.headers) options.headers = {};
			options.headers.sig = typeCache[typeName].sig;
		}
		else typeInCache = false;
		let oldSuccess = options.success;
		function success(value, textStatus, jqXHR) {
			if (oldSuccess) {
				if (!(oldSuccess instanceof Array)) oldSuccess = [oldSuccess];
				for (const success of oldSuccess) success(value, textStatus, jqXHR);
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