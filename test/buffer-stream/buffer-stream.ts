import assert from '../../dist/lib/assert'
import BufferStream from '../../dist/lib/buffer-stream'

const emptyBufferTest = new Promise((resolve, reject) => {
	const inBuffer = new ArrayBuffer(0)
	const bs = new BufferStream(inBuffer)
	const outChunks: Buffer[] = []
	bs
		.on('data', chunk => outChunks.push(chunk as Buffer))
		.on('end', () => {
			try {
				assert.equal(Buffer.concat(outChunks), Buffer.from(inBuffer))
				resolve()
			}
			catch (e) { reject(e) }
		})
})
const multiChunkTest = new Promise((resolve, reject) => {
	const inBuffer = Buffer.allocUnsafe(100000).fill(Math.floor(Math.random() * 0x100)).buffer
	const bs = new BufferStream(inBuffer)
	const outChunks: Buffer[] = []
	bs
		.on('data', chunk => outChunks.push(chunk as Buffer))
		.on('end', () => {
			try {
				assert.equal(Buffer.concat(outChunks), Buffer.from(inBuffer))
				resolve()
			}
			catch (e) { reject(e) }
		})
})
export = Promise.all([emptyBufferTest, multiChunkTest])