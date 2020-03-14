import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.BooleanTupleType(12)
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x31, 12]))
	const readType = r.type(buffer)
	assert(type.equals(readType))
	assert.throws(
		() => new t.BooleanTupleType(1.2),
		(err: Error) => err.message === '1.2 is not an integer'
	)
	assert.throws(
		() => new t.BooleanTupleType(-1),
		(err: Error) => err.message === '-1 is not in [0,Infinity)'
	)

	assert(!type.equals(undefined))
	assert(!type.equals(100))
	assert(!type.equals(new t.BooleanArrayType))
	assert(!type.equals(new t.BooleanTupleType(13)))
	assert(type.equals(new t.BooleanTupleType(12)))
}