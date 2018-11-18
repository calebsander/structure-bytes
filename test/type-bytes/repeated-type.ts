import {r} from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom, concat} from '../test-common'

export = () => {
	const REPEATED_TYPE = 0xff
	interface Person {
		dob: Date
		id: number
		name: string
	}
	const personType = new t.StructType<Person>({
		dob: new t.DateType,
		id: new t.UnsignedShortType,
		name: new t.StringType
	})
	const tribeType = new t.StructType({
		leader: personType,
		members: new t.SetType(personType),
		money: new t.MapType(personType, new t.FloatType)
	})
	const buffer = tribeType.toBuffer()
	assert.deepEqual(new Uint8Array(buffer),
		concat([
			bufferFrom([0x51, 3, 6, 0x6c, 0x65, 0x61, 0x64, 0x65, 0x72]),
			new Uint8Array(personType.toBuffer()),
			bufferFrom([7, 0x6d, 0x65, 0x6d, 0x62, 0x65, 0x72, 0x73, 0x53, REPEATED_TYPE, 27]),
			bufferFrom([5, 0x6d, 0x6f, 0x6e, 0x65, 0x79, 0x54, REPEATED_TYPE, 36, 0x20])
		])
	)
	assert(tribeType.equals(r.type(buffer)))
	const personCube = new t.ArrayType(
		new t.ArrayType(
			new t.ArrayType(
				new t.ChoiceType<number | string | null | undefined | Person>([
					new t.ByteType,
					new t.UnsignedIntType,
					new t.UnsignedLongType,
					new t.StringType,
					new t.OptionalType<Person>(personType)
				])
			)
		)
	)
	assert.deepEqual(new Uint8Array(personCube.toBuffer()), concat([
		bufferFrom([0x52, 0x52, 0x52, 0x56, 5, 0x01, 0x13, 0x14, 0x41, 0x60]),
		new Uint8Array(personType.toBuffer()) //ensure that no repeated type is used
	]))
}