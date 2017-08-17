import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'

export = () => {
	const gb = new GrowableBuffer(0)
	let i: number
	for (i = 0; i < 100000; i++) gb.add(i % 0x100)
	for (i = 0; i < 100000; i++) assert.equal(gb.get(i), i % 0x100)
	assert.throws(
		() => gb.get(i),
		'Index out of bounds: 100000 (100000 is not in [0,100000))'
	)
	const gb2 = new GrowableBuffer
	assert.equal(gb2.rawBuffer.byteLength, 10)
	gb2.grow(100)
	assert.equal(gb2.rawBuffer.byteLength, 200)
	gb2.grow(90)
	assert.equal(gb2.rawBuffer.byteLength, 200)
}