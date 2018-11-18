import {strict as assert} from 'assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import * as strint from '../../dist/lib/strint'
import {bufferFill, bufferFrom} from '../test-common'

export = () => {
	const type = new t.UnsignedLongType
	const gb = new GrowableBuffer
	const VALUE = '18446744073709551615'
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFill(8, 0xff))
	assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)
	assert.deepEqual(new Uint8Array(type.valueBuffer('0')), bufferFill(8, 0x00))
	assert.equal(type.readValue(bufferFill(8, 0x00).buffer), '0')
	assert.deepEqual(new Uint8Array(type.valueBuffer(String(2 ** 32))), bufferFrom([0, 0, 0, 1, 0, 0, 0, 0]))
	assert.equal(type.readValue(bufferFrom([0, 0, 0, 1, 0, 0, 0, 0]).buffer), String(2 ** 32))

	assert.throws(
		() => type.writeValue(gb, [true] as any),
		(err: Error) => err.message === '[true] is not an instance of String'
	)
	assert.throws(
		() => type.writeValue(gb, '120971.00'),
		(err: Error) => err.message === 'Illegal strint format: 120971.00'
	)

	//For more coverage of strint
	assert.equal(strint.mulPositive('0', '0'), '0')
}