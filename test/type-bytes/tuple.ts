import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.TupleType({
		type: new t.BooleanArrayType,
		length: 3
	})
	const buffer = type.toBuffer()
	assert.equal(buffer, bufferFrom([0x50, 0x32, 3]))
	assert.equal(r.type(buffer), type)
	assert.throws(
		() => new t.TupleType({type: new t.StringType, length: 256}),
		'256 is not in [0,256)'
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