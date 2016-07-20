/*eslint-env browser*/
(() => {
	const assert = require('/lib/assert.js');
	assert.instanceOf(window.Map, Function);
	assert.instanceOf(window.Set, Function);
	assert.instanceOf(window.ArrayBuffer, Function);
	assert.instanceOf(window.Uint8Array, Function);
	assert.instanceOf(window.Symbol, Function);
	const GrowableBuffer = require('/lib/growable-buffer.js');
	require('/client-side/binary-ajax.js');
	if (window.sb === undefined) window.sb = require('/structure-types.js');
	else if (!(window.sb instanceof Object)) throw new Error('window.sb is already defined');
	window.sb.upload = ({type, value}, options) => {
		assert.instanceOf(type, window.sb.Type);
		assert.instanceOf(options, Object);
		if (!(options.type === 'POST' || options.method === 'POST')) throw new Error('Must use POST when uploading');
		const buffer = new GrowableBuffer;
		type.writeValue(buffer, value);
		options.processData = false;
		const rawBuffer = buffer.rawBuffer;
		options.data = rawBuffer.buffer.slice(0, buffer.length);
		$.ajax(options); //eslint-disable-line no-undef
	};
})();