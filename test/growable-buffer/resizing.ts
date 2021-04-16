import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import {assert} from '../test-common'

interface GrowableBufferPrivate {
	buffer: ArrayBuffer
}

export = () => {
	{
		const gb = new GrowableBuffer(0)
		let i: number
		for (i = 0; i < 100000; i++) gb.add(i & 0xFF)
		const buffer = new Uint8Array(gb.toBuffer())
		assert.equal(buffer.length, 100000)
		for (i = 0; i < 100000; i++) assert.equal(buffer[i], i & 0xFF)
		const gb2 = new GrowableBuffer
		assert.equal((gb2 as unknown as GrowableBufferPrivate).buffer.byteLength, 10)
		gb2.grow(100)
		assert.equal((gb2 as unknown as GrowableBufferPrivate).buffer.byteLength, 200)
		gb2.grow(90)
		assert.equal((gb2 as unknown as GrowableBufferPrivate).buffer.byteLength, 200)
	}

	{
		const gb = new GrowableBuffer(3)
		gb.add(10).add(20).add(30)
		assert.equal(gb.length, 3)
		assert.strictEqual(gb.toBuffer(), (gb as unknown as GrowableBufferPrivate).buffer)
		assert.deepEqual(gb.toUint8Array(), new Uint8Array([10, 20, 30]))
		gb.add(40)
		assert.equal((gb as unknown as GrowableBufferPrivate).buffer.byteLength, 8)
		assert.deepEqual(gb.toUint8Array(), new Uint8Array([10, 20, 30, 40]))
	}
}