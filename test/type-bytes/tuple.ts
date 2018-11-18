import {r} from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

export = () => {
	const type = new t.TupleType({
		type: new t.BooleanArrayType,
		length: 3
	})
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x50, 0x32, 3]))
	assert(type.equals(r.type(buffer)))
	assert.throws(
		() => new t.TupleType({type: new t.StringType, length: 256}),
		(err: Error) => err.message === '256 is not in [0,256)'
	)

	assert(!type.equals(new t.StringType))
	assert(!type.equals(new t.TupleType({
		type: new t.CharType,
		length: 4
	})))
	assert(!type.equals(new t.TupleType({
		type: new t.BooleanType,
		length: 3
	})))
	assert(!type.equals(new t.TupleType({
		type: new t.BooleanArrayType,
		length: 5
	})))
	assert(type.equals(new t.TupleType({
		type: new t.BooleanArrayType,
		length: 3
	})))
}