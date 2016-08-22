/*eslint-env browser*/
//from https://gist.githubusercontent.com/SaneMethod/7548768/raw/ae22b1fa2e6f56ae6c87ad0d7fbae8fd511e781f/jquery-ajax-blob-arraybuffer.js
($ => {
	/*
	 * Register ajax transports for blob send/recieve and array buffer send/receive via XMLHttpRequest Level 2
	 * within the comfortable framework of the jquery ajax request, with full support for promises.
	 *
	 * Notice the +* in the dataType string? The + indicates we want this transport to be prepended to the list
	 * of potential transports (so it gets first dibs if the request passes the conditions within to provide the
	 * ajax transport, preventing the standard transport from hogging the request), and the * indicates that
	 * potentially any request with any dataType might want to use the transports provided herein.
	 *
	 * Remember to specify 'processData:false' in the ajax options when attempting to send a blob or arraybuffer -
	 * otherwise jquery will try (and fail) to convert the blob or buffer into a query string.
	 *
	 * This revision now includes sending headers, resolves the stack overflow in abort(), and sets the status text
	 * into the response if the request is unsuccessful.
	 */
	$.ajaxTransport('+*', options => {
		// Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
		// level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
		// and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
		if (window.FormData && ((options.dataType === 'blob' || options.dataType === 'arraybuffer') ||
			(options.data && (
				(window.Blob && options.data instanceof Blob) ||
				(window.ArrayBuffer && options.data instanceof ArrayBuffer)
			))
		)) {
			let xhr

			return {
				/*
				 * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
				 * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
				 * into the jquery complete callback (such as the success function, done blocks, etc.)
				 *
				 * @param headers
				 * @param completeCallback
				 */
				send(headers, completeCallback) {
					const url = options.url || location.href,
						type = options.type || 'GET',
						dataType = options.dataType || 'text',
						data = options.data || null,
						async = options.async || true

					xhr = new XMLHttpRequest()
					xhr.addEventListener('load', () => {
						const res = {},
							success = (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304

						if (success) res[dataType] = xhr.response
						else res.text = xhr.statusText

						completeCallback(xhr.status, xhr.statusText, res, xhr.getAllResponseHeaders())
					})

					xhr.open(type, url, async)
					xhr.responseType = dataType

					for (const key in headers) {
						if ({}.hasOwnProperty.call(headers, key)) xhr.setRequestHeader(key, headers[key])
					}

					xhr.send(data)
				},
				abort() {
					if (xhr) xhr.abort()
				}
			}
		}
	})
})(jQuery) //eslint-disable-line no-undef