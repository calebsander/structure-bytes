/*eslint-disable no-undef*/
let type = new t.EnumType({
	type: new t.StringType,
	values: [
		'AVAILABLE',
		'IN_USE',
		'MISSING'
	]
})
assert.equal(type.valueBuffer('AVAILABLE'), bufferFrom([0]))
assert.equal(type.valueBuffer('IN_USE'), bufferFrom([1]))
let valueBuffer = type.valueBuffer('MISSING')
assert.equal(valueBuffer, bufferFrom([2]))
assert.equal(r.value({buffer: valueBuffer, type}), 'MISSING')
let gb = new GrowableBuffer
assert.throws(
	() => type.writeValue(gb, 'OTHER'),
	"Not a valid enum value: 'OTHER'"
)
assert.throws(
	() => type.writeValue(gb, 101),
	'101 is not an instance of String'
)
assert.throws(
	() => r.value({buffer: bufferFrom([3]), type}),
	'Index 3 is invalid'
)

const HUMAN = {heightFt: 6, speedMph: 28}
const CHEETAH = {heightFt: 3, speedMph: 70}
type = new t.EnumType({
	type: new t.StructType({
		heightFt: new t.FloatType,
		speedMph: new t.UnsignedByteType
	}),
	values: [
		HUMAN,
		CHEETAH
	]
})
assert.equal(type.valueBuffer({heightFt: 3, speedMph: 70}), bufferFrom([1]))