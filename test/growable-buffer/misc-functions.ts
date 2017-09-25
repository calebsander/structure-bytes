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
	assert.equal(gb3.toBuffer(), new Uint8Array(nums).buffer)
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
	assert.equal(gb3.toBuffer(), new Uint8Array(nums).buffer)

	const gb4 = new GrowableBuffer
	gb4.add(1).add(2)
	assert.throws(
		() => gb4.resume(),
		'Was not paused'
	)
	assert.throws(
		() => gb4.reset(),
		'Was not paused'
	)
	gb4.pause()
	assert.throws(
		() => gb4.pause(),
		'Already paused'
	)
	gb4.add(3).add(4)
	assert.equal(gb4.toBuffer(), new Uint8Array([1, 2]).buffer)
}