import {Writable} from 'stream'
import AppendableStream from '../../dist/lib/appendable-stream'
import {assert} from '../test-common'

class CaptureStream extends Writable {
	private readonly chunks: Buffer[]

	constructor() {
		super()
		this.chunks = []
	}

	_write(chunk: Buffer, _: string, callback: (err?: Error) => void) {
		this.chunks.push(chunk)
		callback()
	}
	getWritten(): Buffer {
		return Buffer.concat(this.chunks)
	}
}

const testBasic = new Promise<void>((resolve, reject) => {
	assert.throws(
		() => new AppendableStream(0 as any),
		(err: Error) => err.message === '0 is not an instance of Writable or Duplex or OutgoingMessage'
	)
	const outStream = new CaptureStream
	outStream.on('finish', () => {
		try {
			assert.deepEqual(outStream.getWritten(), Buffer.from([1, 2, 3, 4, 5, 6, 7]))
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
		(err: Error) => err.message === '"abc" is not an instance of Number'
	)
	assert.throws(
		() => stream.add(-1),
		(err: Error) => err.message === 'Not a byte: -1 (-1 is not in [0,256))'
	)
	assert.throws(
		() => stream.add(256),
		(err: Error) => err.message === 'Not a byte: 256 (256 is not in [0,256))'
	)
	assert.throws(
		() => stream.add(1.3),
		(err: Error) => err.message === '1.3 is not an integer'
	)
	assert.throws(
		() => stream.addAll(Buffer.from([5, 6]) as any),
		(err: Error) => err.message === '<Buffer 05 06> is not an instance of ArrayBuffer'
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
const testPause = new Promise<void>((resolve, reject) => {
	const outStream = new CaptureStream
	outStream.on('finish', () => {
		try {
			assert.deepEqual(outStream.getWritten(), Buffer.from([1, 2, 3, 4, 9, 10]))
			resolve()
		}
		catch (e) { reject(e) }
	})
	const stream = new AppendableStream(outStream)
	stream
		.add(1).add(2)
	assert.equal(stream.length, 2)
	assert.throws(
		() => stream.resume(),
		(err: Error) => err.message === 'Was not paused'
	)
	assert.throws(
		() => stream.reset(),
		(err: Error) => err.message === 'Was not paused'
	)
	stream
		.pause()
			.add(3).add(4)
	assert.equal(stream.length, 4)
	stream
			.pause()
				.add(5).add(6)
	assert.equal(stream.length, 6)
	stream
				.pause()
					.add(7).add(8)
	assert.equal(stream.length, 8)
	stream
				.resume()
	assert.equal(stream.length, 8)
	stream
				.reset()
	assert.equal(stream.length, 4)
	stream
				.add(9)
			.resume()
	assert.equal(stream.length, 5)
	stream
			.add(10)
	assert.equal(stream.length, 6)
	stream
		.resume()
	assert.equal(stream.length, 6)
	assert.throws(
		() => stream.resume(),
		(err: Error) => err.message === 'Was not paused'
	)
	assert.throws(
		() => stream.reset(),
		(err: Error) => err.message === 'Was not paused'
	)
	stream.end()
})

export = Promise.all([testBasic, testPause])