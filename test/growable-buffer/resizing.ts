import {strict as assert} from 'assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {bufferFrom} from '../test-common'

export = () => {
	{
		const gb = new GrowableBuffer(0)
		let i: number
		for (i = 0; i < 100000; i++) gb.add(i & 0xFF)
		const buffer = new Uint8Array(gb.toBuffer())
		assert.equal(buffer.length, 100000)
		for (i = 0; i < 100000; i++) assert.equal(buffer[i], i & 0xFF)
		const gb2 = new GrowableBuffer
		assert.equal(gb2.rawBuffer.byteLength, 10)
		gb2.grow(100)
		assert.equal(gb2.rawBuffer.byteLength, 200)
		gb2.grow(90)
		assert.equal(gb2.rawBuffer.byteLength, 200)
	}

	{
		const gb = new GrowableBuffer(3)
		gb.add(10).add(20).add(30)
		assert.equal(gb.length, 3)
		assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array(gb.rawBuffer))
		assert.deepEqual(new Uint8Array(gb.rawBuffer), bufferFrom([10, 20, 30]))
		gb.add(40)
		assert.equal(gb.rawBuffer.byteLength, 8)
		assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([10, 20, 30, 40]))
	}
}