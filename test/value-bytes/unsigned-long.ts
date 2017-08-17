import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFill} from '../test-common'

export = () => {
	const type = new t.UnsignedLongType
	const gb = new GrowableBuffer
	const VALUE = '18446744073709551615'
	type.writeValue(gb, VALUE)
	assert.equal(gb.toBuffer(), bufferFill(8, 0xff))
	assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)

	assert.throws(
		() => type.writeValue(gb, [true] as any),
		'[true] is not an instance of String'
	)
	assert.throws(
		() => type.writeValue(gb, '120971.00'),
		'Illegal strint format: 120971.00'
	)
}