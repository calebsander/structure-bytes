/*eslint-env browser*/
(() => {
	require('/client-side/common.js');
	const assert = require('/lib/assert.js');
	window.sb.upload = ({type, value}, options) => {
		assert.instanceOf(type, window.sb.Type);
		assert.instanceOf(options, Object);
		if (!(options.type === 'POST' || options.method === 'POST')) throw new Error('Must use POST when uploading');
		options.processData = false;
		options.data = type.valueBuffer(value);
		$.ajax(options); //eslint-disable-line no-undef
	};
})();