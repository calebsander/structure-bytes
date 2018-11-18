import {strict as assert} from 'assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.BooleanTupleType(12)
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x31, 12]))
	const readType = r.type(buffer)
	assert(type.equals(readType))
	assert.throws(
		() => new t.BooleanTupleType(256),
		(err: Error) => err.message === '256 is not in [0,256)'
	)

	assert(!type.equals(undefined))
	assert(!type.equals(100))
	assert(!type.equals(new t.BooleanArrayType))
	assert(!type.equals(new t.BooleanTupleType(13)))
	assert(type.equals(new t.BooleanTupleType(12)))
}