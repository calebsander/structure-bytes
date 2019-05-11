import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.EnumType({
		type: new t.StringType,
		values: [
			'AVAILABLE',
			'IN_USE',
			'MISSING'
		]
	})
	assert.deepEqual(new Uint8Array(type.valueBuffer('AVAILABLE')), new Uint8Array([0]))
	assert.deepEqual(new Uint8Array(type.valueBuffer('IN_USE')), new Uint8Array([1]))
	const buffer = type.valueBuffer('MISSING')
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([2]))
	assert.equal(type.readValue(buffer), 'MISSING')

	assert.throws(
		() => type.valueBuffer('OTHER'),
		(err: Error) => err.message === 'Not a valid enum value: "OTHER"'
	)
	assert.throws(
		() => type.valueBuffer(101 as any),
		(err: Error) => err.message === '101 is not an instance of String'
	)
	assert.throws(
		() => type.readValue(new Uint8Array([type.values.length]).buffer),
		(err: Error) => err.message === 'Index 3 is invalid'
	)

	const HUMAN = {heightFt: 6, speedMph: 28}
	const CHEETAH = {heightFt: 3, speedMph: 70}
	const type2 = new t.EnumType({
		type: new t.StructType({
			heightFt: new t.FloatType,
			speedMph: new t.UnsignedByteType
		}),
		values: [
			HUMAN,
			CHEETAH
		]
	})
	assert.deepEqual(new Uint8Array(type2.valueBuffer({heightFt: 3, speedMph: 70})), new Uint8Array([1]))
}