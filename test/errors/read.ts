import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import AbstractType from '../../dist/types/abstract'
import {bufferFrom} from '../test-common'

export = () => {
	assert.throws(
		() => r.value({type: new t.OctetsType, buffer: bufferFrom([0b10000000])}),
		'Buffer is not long enough'
	)
	assert.throws(
		() => r.type(bufferFrom([t.TupleType._value, t.ByteType._value])),
		'Buffer is not long enough'
	)
	assert.throws(
		() => r.value({buffer: new ArrayBuffer(0), type: new (AbstractType as any)}),
		'Not a structure type: AbstractType {}'
	)
	assert.throws(
		() => r.type(bufferFrom([0xaa])),
		'No such type: 0xaa'
	)
}