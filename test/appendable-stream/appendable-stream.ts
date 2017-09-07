import {Writable} from 'stream'
import AppendableStream from '../../dist/lib/appendable-stream'
import assert from '../../dist/lib/assert'

class CaptureStream extends Writable {
	private readonly chunks: Buffer[]

	constructor() {
		super()
		this.chunks = []
	}

	_write(chunk: Buffer, _: string, callback: (err: Error | null) => void) {
		this.chunks.push(chunk)
		callback(null)
	}
	getWritten(): Buffer {
		return Buffer.concat(this.chunks)
	}
}

export = new Promise((resolve, reject) => {
	assert.throws(
		() => new AppendableStream(0 as any),
		'0 is not an instance of Writable'
	)
	const outStream = new CaptureStream
	outStream.on('finish', () => {
		try {
			assert.equal(outStream.getWritten(), Buffer.from([1, 2, 3, 4, 5, 6, 7]))
			resolve()
		}
		catch (e) { reject(e) }
	})
	const stream = new AppendableStream(outStream)
	assert.equal(stream.length, 0)
	stream.add(1)
	assert.equal(stream.length, 1)
	stream.addAll(new Uint8Array([2, 3, 4]).buffer)
	assert.equal(stream.length, 4)
	assert.throws(
		() => stream.add('abc' as any),
		'"abc" is not an instance of Number'
	)
	assert.throws(
		() => stream.add(-1),
		'Not a byte: -1 (-1 is not in [0,256))'
	)
	assert.throws(
		() => stream.add(256),
		'Not a byte: 256 (256 is not in [0,256))'
	)
	assert.throws(
		() => stream.add(1.3),
		'1.3 is not an integer'
	)
	assert.throws(
		() => stream.addAll(Buffer.from([5, 6]) as any),
		'<Buffer 05 06> is not an instance of ArrayBuffer'
	)
	assert.equal(stream.length, 4)
	stream.addAll(new ArrayBuffer(0))
	assert.equal(stream.length, 4)
	stream.addAll(new Uint8Array([5, 6]).buffer)
	assert.equal(stream.length, 6)
	stream.add(7)
	assert.equal(stream.length, 7)
	stream.end()
})