import {strict as assert} from 'assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFill, bufferFrom} from '../test-common'

export = () => {
	const type = new t.IntType
	const gb = new GrowableBuffer
	const VALUE = -2147483648
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([0x80, 0x00, 0x00, 0x00]))
	assert.equal(type.readValue(gb.toBuffer()), VALUE)

	assert.deepEqual(new Uint8Array(type.valueBuffer('-1')), bufferFill(4, 0xff))
}