import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.TupleType({
		type: new t.BooleanArrayType,
		length: 3
	})
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x50, 0x32, 3]))
	assert(type.equals(r.type(buffer)))
	assert.throws(
		() => new t.TupleType({type: new t.StringType, length: 45.6}),
		(err: Error) => err.message === '45.6 is not an integer'
	)
	assert.throws(
		() => new t.TupleType({type: new t.StringType, length: -10}),
		(err: Error) => err.message === '-10 is not in [0,Infinity)'
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