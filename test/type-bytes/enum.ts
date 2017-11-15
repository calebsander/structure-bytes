import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const tooManyValues = new Array<string>(256)
	for (let i = 0; i < tooManyValues.length; i++) tooManyValues[i] = 'A'.repeat(i)
	for (const [invalidValues, message] of [
		['asdf', '"asdf" is not an instance of Array'],
		[[2], '2 is not an instance of String'],
		[[true], 'true is not an instance of String'],
		[[undefined], 'undefined is not an instance of String'],
		[['abc', 3], '3 is not an instance of String'],
		[['1', '2', '1'], 'Value is repeated: "1"'],
		[tooManyValues, '256 values is too many']
	]) {
		assert.throws(
			() => {
				new t.EnumType({
					type: new t.StringType,
					values: invalidValues as any
				})
			},
			message as string
		)
	}

	{
		const type = new t.EnumType({
			type: new t.StringType,
			values: [
				'ABC',
				'DEF',
				'GHI'
			]
		})
		assert.equal(type.toBuffer(), bufferFrom([0x55, 0x41, 3, 0x41, 0x42, 0x43, 0, 0x44, 0x45, 0x46, 0, 0x47, 0x48, 0x49, 0]))
		assert.equal(r.type(type.toBuffer()), type)
	}

	{
		const HUMAN = {heightFt: 6, speedMph: 28}
		const CHEETAH = {heightFt: 3, speedMph: 70}
		const type = new t.EnumType({
			type: new t.StructType({
				heightFt: new t.FloatType,
				speedMph: new t.UnsignedByteType
			}),
			values: [
				HUMAN,
				CHEETAH
			]
		})
		assert.equal(type.toBuffer(), bufferFrom([0x55, 0x51, 2, 8, 0x68, 0x65, 0x69, 0x67, 0x68, 0x74, 0x46, 0x74, 0x20, 8, 0x73, 0x70, 0x65, 0x65, 0x64, 0x4d, 0x70, 0x68, 0x11, 2, 0x40, 0xc0, 0x00, 0x00, 28, 0x40, 0x40, 0x00, 0x00, 70]))
		assert.equal(r.type(type.toBuffer()), type)
	}

	{
		const type1 = new t.EnumType({
			type: new t.FlexUnsignedIntType,
			values: [1, 2, 3]
		})
		assert(!type1.equals(new t.IntType))
		const type2 = new t.EnumType({
			type: new t.UnsignedByteType,
			values: [1, 2, 3]
		})
		assert(!type1.equals(type2)) //value bytes are identical, but types don't match
		const type3 = new t.EnumType({
			type: new t.UnsignedByteType,
			values: [1, 2]
		})
		const type4 = new t.EnumType({
			type: new t.UnsignedByteType,
			values: [1, 2, 3, 4]
		})
		assert(!type2.equals(type3))
		assert(!type2.equals(type4))
		const type5 = new t.EnumType({
			type: new t.UnsignedByteType,
			values: [1, 2, 5]
		})
		assert(!type2.equals(type5))
		const type6 = new t.EnumType<number | string>({
			type: new t.UnsignedByteType,
			values: ['1', '2', '3']
		})
		assert(type2.equals(type6))
	}
}