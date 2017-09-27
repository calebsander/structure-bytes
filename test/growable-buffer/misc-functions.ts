import assert from '../../dist/lib/assert'
import * as bufferString from '../../dist/lib/buffer-string'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {bufferFrom} from '../test-common'

export = () => {
	const gb = new GrowableBuffer
	for (let i = 0; i < 10; i++) gb.addAll(bufferString.fromString('abc'))
	const gb2 = new GrowableBuffer
	gb2.addAll(bufferString.fromString('abc'.repeat(10)))
	assert.equal(gb.toBuffer(), gb2.toBuffer())
	assert.equal(gb.toBuffer(), bufferFrom([
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63,
		0x61, 0x62, 0x63
	]))
	const gb3 = new GrowableBuffer
	const nums: number[] = []
	for (let i = 0; i < 100; i++) {
		gb3.add(i)
		nums.push(i)
	}
	assert.equal(gb3.length, 100)
	assert.equal(gb3.toBuffer(), bufferFrom(nums))
	assert.throws(
		() => gb3.add(undefined as any),
		'undefined is not an instance of Number'
	)
	assert.throws(
		() => gb3.add(0x100),
		'Not a byte: 256 (256 is not in [0,256))'
	)
	assert.throws(
		() => gb3.add(1.2),
		'1.2 is not an integer'
	)
	assert.throws(
		() => gb3.addAll('abc' as any),
		'"abc" is not an instance of ArrayBuffer'
	)
	assert.equal(gb3.toBuffer(), bufferFrom(nums))

	const gb4 = new GrowableBuffer
	gb4
		.add(1).add(2)
	assert.equal(gb4.length, 2)
	assert.throws(
		() => gb4.resume(),
		'Was not paused'
	)
	assert.throws(
		() => gb4.reset(),
		'Was not paused'
	)
	gb4
		.pause()
			.add(3).add(4)
	assert.equal(gb4.length, 4)
	gb4
			.pause()
				.add(5).add(6)
	assert.equal(gb4.length, 6)
	gb4
				.pause()
					.add(7).add(8)
	assert.equal(gb4.toBuffer(), bufferFrom([1, 2]))
	assert.equal(gb4.length, 8)
	gb4
				.resume()
	assert.equal(gb4.toBuffer(), bufferFrom([1, 2]))
	assert.equal(gb4.length, 8)
	gb4
				.reset()
	assert.equal(gb4.length, 4)
	gb4
				.add(9)
			.resume()
	assert.equal(gb4.length, 5)
	gb4
			.add(10)
	assert.equal(gb4.toBuffer(), bufferFrom([1, 2]))
	assert.equal(gb4.length, 6)
	gb4
		.resume()
	assert.equal(gb4.toBuffer(), bufferFrom([1, 2, 3, 4, 9, 10]))
	assert.equal(gb4.length, 6)
	assert.throws(
		() => gb4.resume(),
		'Was not paused'
	)
	assert.throws(
		() => gb4.reset(),
		'Was not paused'
	)
}