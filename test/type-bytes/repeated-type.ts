import {r} from '../../dist'
import * as t from '../../dist'
import {assert, concat} from '../test-common'

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
			new Uint8Array([0x51, 3, 0x6c, 0x65, 0x61, 0x64, 0x65, 0x72, 0]),
			new Uint8Array(personType.toBuffer()),
			new Uint8Array([0x6d, 0x65, 0x6d, 0x62, 0x65, 0x72, 0x73, 0, 0x53, REPEATED_TYPE, 26]),
			new Uint8Array([0x6d, 0x6f, 0x6e, 0x65, 0x79, 0, 0x54, REPEATED_TYPE, 9, 0x20])
		])
	)
	assert(tribeType.equals(r.type(buffer)))
	const personCube = new t.ArrayType(
		new t.ArrayType(
			new t.ArrayType(
				new t.ChoiceType<number | string | null | undefined | Person>([
					new t.ByteType,
					new t.UnsignedIntType,
					new t.StringType,
					new t.OptionalType<Person>(personType)
				])
			)
		)
	)
	assert.deepEqual(new Uint8Array(personCube.toBuffer()), concat([
		new Uint8Array([0x52, 0x52, 0x52, 0x56, 4, 0x01, 0x13, 0x41, 0x60]),
		new Uint8Array(personType.toBuffer()) //ensure that no repeated type is used
	]))

	assert.throws(
		() => r.type(new Uint8Array([REPEATED_TYPE, 0])),
		({message}: Error) => message === 'Buffer has no repeated types'
	)
	const tupleType = new t.TupleType({type: new t.ByteType, length: 10})
	const tupleTypeBuffer = new Uint8Array(tupleType.toBuffer())
	assert.deepEqual(tupleTypeBuffer, new Uint8Array([0x50, 0x01, 10]))
	assert.throws(
		() => r.type(concat([
			// new MapType(tupleType, invalidRepeatedType)
			new Uint8Array([0x54]), tupleTypeBuffer, new Uint8Array([REPEATED_TYPE, 1])
		])),
		({message}: Error) => message === 'No type was read at offset 3'
	)
}