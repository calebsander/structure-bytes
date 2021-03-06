import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.ChoiceType<number | string>([new t.UnsignedByteType, new t.UnsignedIntType, new t.StringType])
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x56, 3, 0x11, 0x13, 0x41]))
	assert(type.equals(r.type(buffer)))

	assert.throws(
		() => new t.ChoiceType(123 as any),
		(err: Error) => err.message === '123 is not an instance of Array'
	)
	assert.throws(
		() => new t.ChoiceType([123 as any]),
		(err: Error) => err.message === '123 is not an instance of AbstractType'
	)

	assert(!type.equals(new t.UnsignedByteType))
	assert(!type.equals(new t.ChoiceType<number | string>([new t.UnsignedByteType, new t.UnsignedIntType, new t.StringType, new t.StringType])))
	assert(!type.equals(new t.ChoiceType<number | string>([new t.UnsignedByteType, new t.UnsignedIntType])))
	assert(!type.equals(new t.ChoiceType<number | string>([new t.UnsignedByteType, new t.StringType, new t.UnsignedIntType])))
	assert(type.equals(new t.ChoiceType<number | string>([new t.UnsignedByteType, new t.UnsignedIntType, new t.StringType])))
}