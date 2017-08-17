import assert from '../../dist/lib/assert'
import * as bufferString from '../../dist/lib/buffer-string'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {bufferFill, bufferFrom} from '../test-common'

export = () => {
	const gb = new GrowableBuffer
	for (let i = 0; i < 10; i++) gb.addAll(bufferString.fromString('abc'))
	const gb2 = new GrowableBuffer
	gb2.addAll(bufferString.fromString('abc'.repeat(10)))
	assert.equal(gb.toBuffer(), gb2.toBuffer())
	const gb3 = new GrowableBuffer
	for (let i = 0; i < 100; i++) {
		assert.throws(
			() => gb3.set(i, i),
			'Index out of bounds: '
		)
		gb3.add(i)
	}
	const buffer = bufferFill(4, 0xbe)
	for (let i = 0; i < 100; i++) {
		if (i > 96) {
			assert.throws(
				() => gb3.setAll(i, buffer),
				'Index out of bounds: 9'
			)
		}
		else gb3.setAll(i, buffer)
	}
	for (let i = 0; i < gb3.length; i++) assert.equal(gb3.get(i), 0xbe)
	const gb4 = new GrowableBuffer
	gb4.add(1).add(2).add(3)
	gb4.set(2, 6).set(1, 5).set(0, 4)
	assert.equal(gb4.toBuffer(), bufferFrom([4, 5, 6]))
	assert.throws(
		() => gb4.set(1, 256),
		'Not a byte: 256 (256 is not in [0,256))'
	)
	assert.throws(
		() => gb4.add(undefined as any),
		'undefined is not an instance of Number'
	)
	assert.throws(
		() => gb4.add(0x100),
		'Not a byte: 256 (256 is not in [0,256))'
	)
	assert.throws(
		() => gb4.add(1.2),
		'1.2 is not an integer'
	)
}