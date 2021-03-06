import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	for (const [invalidValues, message] of [
		['asdf', '"asdf" is not an instance of Array'],
		[[2], '2 is not an instance of String'],
		[[true], 'true is not an instance of String'],
		[[undefined], 'undefined is not an instance of String'],
		[['abc', 3], '3 is not an instance of String'],
		[['1', '2', '1'], 'Value is repeated: "1"']
	] as [any, string][]) {
		assert.throws(
			() => new t.EnumType({
				type: new t.StringType,
				values: invalidValues
			}).toBuffer(),
			(err: Error) => err.message === message
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
		assert.deepEqual(new Uint8Array(type.toBuffer()), new Uint8Array([
			0x55,
				0x41,
				3,
					0x41, 0x42, 0x43, 0,
					0x44, 0x45, 0x46, 0,
					0x47, 0x48, 0x49, 0
		]))
		assert(type.equals(r.type(type.toBuffer())))
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
		assert.deepEqual(new Uint8Array(type.toBuffer()), new Uint8Array([
			0x55,
				0x51,
					2,
						0x68, 0x65, 0x69, 0x67, 0x68, 0x74, 0x46, 0x74, 0,
							0x20,
						0x73, 0x70, 0x65, 0x65, 0x64, 0x4d, 0x70, 0x68, 0,
							0x11,
				2,
					0x40, 0xc0, 0x00, 0x00, 28,
					0x40, 0x40, 0x00, 0x00, 70
		]))
		assert(type.equals(r.type(type.toBuffer())))
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