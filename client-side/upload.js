/*eslint-env browser*/
(() => {
	require('/client-side/common.js');
	const assert = require('/lib/assert.js');
	/** @function
	 * @name upload
	 * @desc <b>(client-side only)</b>
	 * Uploads a value in an AJAX request.
	 * The type used to write the value must be specified.
	 * To use, include {@link compiled/upload.js} or {@link compiled/upload-download.js}.
	 * @param {{type, value}} params
	 * @param {Type} params.type The type used to write the value.
	 * Only the value is actually sent in the request.
	 * @param {type} params.value The value to upload
	 * @param {Object} options [jQuery AJAX options]{@link https://api.jquery.com/jquery.ajax/#jQuery-ajax-settings}.
	 * These options should specify what URL to use, what to do on success, etc.
	 * {@link options.type} or {@link options.method} must be set to {@link POST}.
	 * {@link options.data} and {@link options.processData} will be overwritten.
	 * @example
	 * var type = new sb.ArrayType(
	 *   new sb.StructType({
	 *     name: new sb.StringType,
	 *     id: new sb.UnsignedShortType
	 *   })
	 * );
	 * sb.upload({type: type, value: [
	 *   {name: 'John', id: 2},
	 *   {name: 'Jane', id: 10}
	 * ]}, {
	 *   url: '/upload-people',
	 *   type: 'POST',
	 *   dataType: 'text',
	 *   success: function(response) {
	 *     alert(response);
	 *   }
	 * });
	 */
	window.sb.upload = ({type, value}, options) => {
		assert.instanceOf(type, sb.Type);
		assert.instanceOf(options, Object);
		if (!(options.type === 'POST' || options.method === 'POST')) assert.fail('Must use POST when uploading');
		options.processData = false;
		options.data = type.valueBuffer(value);
		$.ajax(options); //eslint-disable-line no-undef
	};
})();