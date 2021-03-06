import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.BooleanArrayType
	const gb = new GrowableBuffer
	const VALUE = [true, false, true, true, false, true, true, true, false, false, true]
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([VALUE.length, 0b10110111, 0b00100000]))
	assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)
}