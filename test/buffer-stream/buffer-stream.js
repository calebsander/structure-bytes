/*eslint-disable no-undef*/
const wait = setInterval(() => {}, 10)
new Simultaneity()
	.addTask(s => {
		const inBuffer = new ArrayBuffer(0)
		const bs = new BufferStream(inBuffer)
		const outChunks = []
		bs.on('data', chunk => outChunks.push(chunk)).on('end', () => {
			assert.equal(Buffer.concat(outChunks), Buffer.from(inBuffer))
			s.taskFinished()
		})
	})
	.addTask(s => {
		const inBuffer2 = Buffer.allocUnsafe(100000).buffer
		const bs2 = new BufferStream(inBuffer2)
		const outChunks2 = []
		bs2.on('data', chunk => outChunks2.push(chunk)).on('end', () => {
			assert.equal(Buffer.concat(outChunks2), Buffer.from(inBuffer2))
			s.taskFinished()
		})
	})
	.callback(() => clearInterval(wait))