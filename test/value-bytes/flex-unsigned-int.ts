import {strict as assert} from 'assert'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.FlexUnsignedIntType
	const TWO_7 = 2 ** 7, TWO_14 = 2 ** 14
	for (let value = 0; value < TWO_7; value++) {
		const buffer = type.valueBuffer(value)
		assert.deepEqual(new Uint8Array(buffer), bufferFrom([value]))
		assert.equal(type.readValue(buffer), value)
	}
	for (let value = TWO_7; value < TWO_7 + TWO_14; value++) {
		const relativeValue = value - TWO_7
		const buffer = type.valueBuffer(value)
		assert.deepEqual(new Uint8Array(buffer), bufferFrom([
			0b10000000 | (relativeValue >> 8),
			relativeValue & 0xFF
		]))
		assert.equal(type.readValue(buffer), value)
	}
	for (let value = TWO_7 + TWO_14; value < 50000; value++) {
		const relativeValue = value - (TWO_7 + TWO_14)
		const buffer = type.valueBuffer(value)
		assert.deepEqual(new Uint8Array(buffer), bufferFrom([
			0b11000000 | (relativeValue >> 16),
			(relativeValue >> 8) & 0xFF,
			relativeValue & 0xFF
		]))
		assert.equal(type.readValue(buffer), value)
	}

	function makeMinBuffer(bytes: number) {
		const fullBytes = new Array<number>(bytes - 1)
		fullBytes.fill(0b00000000)
		return bufferFrom(
			[parseInt('1'.repeat(bytes - 1) + '0'.repeat(9 - bytes), 2)]
			.concat(fullBytes)
		)
	}
	function makeMaxBuffer(bytes: number) {
		const fullBytes = new Array<number>(bytes - 1)
		fullBytes.fill(0b11111111)
		return bufferFrom(
			[parseInt('1'.repeat(bytes - 1) + '0' + '1'.repeat(8 - bytes), 2)]
			.concat(fullBytes)
		)
	}
	assert.deepEqual(new Uint8Array(type.valueBuffer(2113663)), makeMaxBuffer(3))
	assert.deepEqual(new Uint8Array(type.valueBuffer(2113664)), makeMinBuffer(4))
	assert.deepEqual(new Uint8Array(type.valueBuffer(270549119)), makeMaxBuffer(4))
	assert.deepEqual(new Uint8Array(type.valueBuffer(270549120)), makeMinBuffer(5))
	assert.deepEqual(new Uint8Array(type.valueBuffer(34630287487)), makeMaxBuffer(5))
	assert.deepEqual(new Uint8Array(type.valueBuffer(34630287488)), makeMinBuffer(6))
	assert.deepEqual(new Uint8Array(type.valueBuffer(4432676798591)), makeMaxBuffer(6))
	assert.deepEqual(new Uint8Array(type.valueBuffer(4432676798592)), makeMinBuffer(7))
	assert.deepEqual(new Uint8Array(type.valueBuffer(567382630219903)), makeMaxBuffer(7))
	assert.deepEqual(new Uint8Array(type.valueBuffer(567382630219904)), makeMinBuffer(8))
	assert.deepEqual(new Uint8Array(type.valueBuffer(Number.MAX_SAFE_INTEGER)), bufferFrom([0b11111110, 0b00011101, 0b11111011, 0b11110111, 0b11101111, 0b11011111, 0b10111111, 0b01111111]))
	assert.equal(type.readValue(type.valueBuffer(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER)
	assert.deepEqual(new Uint8Array(type.valueBuffer('123')), bufferFrom([123]))

	assert.throws(
		() => type.valueBuffer(true as any),
		(err: Error) => err.message === 'true is not an instance of Number'
	)
	assert.throws(
		() => type.valueBuffer(1.2),
		(err: Error) => err.message === '1.2 is not an integer'
	)
	assert.throws(
		() => type.valueBuffer(Number.MAX_SAFE_INTEGER * 2),
		(err: Error) => err.message === '18014398509481982 is not an integer'
	)
	assert.throws(
		() => type.valueBuffer(-1),
		(err: Error) => err.message === '-1 is negative'
	)
	assert.throws(
		() => type.readValue(new ArrayBuffer(0)),
		(err: Error) => err.message === 'Buffer is not long enough'
	)
	assert.throws(
		() => type.readValue(bufferFrom([0b11111111]).buffer),
		(err: Error) => err.message === 'Invalid number of bytes'
	)
	assert.throws(
		() => type.readValue(bufferFrom([0b10000001]).buffer),
		(err: Error) => err.message === 'Buffer is not long enough'
	)
}