import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const map = new t.MapType(
		new t.StringType,
		new t.StructType({
			a: new t.ArrayType(new t.UnsignedByteType),
			'b—c': new t.CharType
		})
	)
	assert.deepEqual(new Uint8Array(map.toBuffer()), new Uint8Array([
		0x54,
			0x41,
			0x51,
				2,
					0x61, 0,
						0x52, 0x11,
					0x62, 0xe2, 0x80, 0x94, 0x63, 0,
						0x40
	]))
	assert(map.equals(r.type(map.toBuffer())))

	const type1 = new t.MapType(
		new t.ByteType,
		new t.ShortType
	)
	const type2 = new t.MapType(
		new t.ShortType,
		new t.ByteType
	)
	const type3 = new t.MapType(
		new t.ByteType,
		new t.IntType
	)
	const type4 = new t.MapType(
		new t.IntType,
		new t.ShortType
	)
	const type5 = new t.MapType(
		new t.ByteType,
		new t.ShortType
	)
	assert(!type1.equals(type2))
	assert(!type1.equals(type3))
	assert(!type1.equals(type4))
	assert(type1.equals(type5))
}