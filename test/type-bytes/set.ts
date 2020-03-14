import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.SetType(
		new t.StructType({
			long: new t.LongType,
			str: new t.StringType
		})
	)
	assert.deepEqual(new Uint8Array(type.toBuffer()), new Uint8Array([
		0x53,
			0x51,
				2,
					0x6c, 0x6f, 0x6e, 0x67, 0,
						0x04,
					0x73, 0x74, 0x72, 0,
						0x41
	]))
	assert(type.equals(r.type(type.toBuffer())))

	const type1 = new t.SetType(
		new t.ArrayType(
			new t.IntType
		)
	)
	assert(!type1.equals(new t.IntType))
	const type2 = new t.SetType(
		new t.ArrayType(
			new t.ByteType
		)
	)
	assert(!type1.equals(type2))
	const type3 = new t.SetType(
		new t.ArrayType(
			new t.IntType
		)
	)
	assert(type1.equals(type3))
}