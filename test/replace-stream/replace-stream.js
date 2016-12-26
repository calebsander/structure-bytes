/*eslint-disable no-undef*/
const wait = setInterval(() => {}, 10)
const stream = new BufferStream(bufferString.fromString('aéééébcéééféghé'))
const output = stream.pipe(new ReplaceStream('éé', 'ee'))
const buffers = []
output
	.on('data', chunk => buffers.push(chunk))
	.on('end', () => {
		const text = Buffer.concat(buffers).toString()
		assert.equal(text, 'aeeeebceeéféghé')
		clearInterval(wait)
	})