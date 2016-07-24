/*eslint-env browser*/
(() => {
	require('/client-side/common.js');
	const assert = require('/lib/assert.js');
	const GrowableBuffer = require('/lib/growable-buffer.js');
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