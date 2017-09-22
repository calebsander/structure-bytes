import assert from '../../dist/lib/assert'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.EnumType({
		type: new t.StringType,
		values: [
			'AVAILABLE',
			'IN_USE',
			'MISSING'
		]
	})
	assert.equal(type.valueBuffer('AVAILABLE'), bufferFrom([0]))
	assert.equal(type.valueBuffer('IN_USE'), bufferFrom([1]))
	const buffer = type.valueBuffer('MISSING')
	assert.equal(buffer, bufferFrom([2]))
	assert.equal(type.readValue(buffer), 'MISSING')

	assert.throws(
		() => type.valueBuffer('OTHER'),
		'Not a valid enum value: "OTHER"'
	)
	assert.throws(
		() => type.valueBuffer(101 as any),
		'101 is not an instance of String'
	)
	assert.throws(
		() => type.readValue(bufferFrom([type.values.length])),
		'Index 3 is invalid'
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
	assert.equal(type2.valueBuffer({heightFt: 3, speedMph: 70}), bufferFrom([1]))
}