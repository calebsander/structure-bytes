import {strict as assert} from 'assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.LongType
	const gb = new GrowableBuffer
	const VALUE = '9223372036854775807'
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))
	assert.equal(type.readValue(gb.toBuffer()), VALUE)

	assert.throws(
		() => type.writeValue(gb, [true] as any),
		(err: Error) => err.message === '[true] is not an instance of String'
	)
	assert.throws(
		() => type.writeValue(gb, '-1.2'),
		(err: Error) => err.message === 'Illegal strint format: -1.2'
	)
}