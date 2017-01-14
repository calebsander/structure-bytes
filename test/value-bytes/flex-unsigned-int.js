/*eslint-disable no-undef*/
const type = new t.FlexUnsignedIntType
const TWO_7 = Math.pow(2, 7),
      TWO_14 = Math.pow(2, 14)
for (let value = 0; value < TWO_7; value++) {
	const valueBuffer = type.valueBuffer(value)
	assert.equal(valueBuffer, bufferFrom([value]))
	assert.equal(r.value({type, buffer: valueBuffer}), value)
}
for (let value = TWO_7; value < TWO_7 + TWO_14; value++) {
	const relativeValue = value - TWO_7
	const valueBuffer = type.valueBuffer(value)
	assert.equal(valueBuffer, bufferFrom([
		0b10000000 | (relativeValue >> 8),
		relativeValue & 0xFF
	]))
	assert.equal(r.value({type, buffer: valueBuffer}), value)
}
for (let value = TWO_7 + TWO_14; value < 50000; value++) {
	const relativeValue = value - (TWO_7 + TWO_14)
	const valueBuffer = type.valueBuffer(value)
	assert.equal(valueBuffer, bufferFrom([
		0b11000000 | (relativeValue >> 16),
		(relativeValue >> 8) & 0xFF,
		relativeValue & 0xFF
	]))
	assert.equal(r.value({type, buffer: valueBuffer}), value)
}
assert.equal(type.valueBuffer('123'), bufferFrom([123]))

assert.throws(
	() => type.valueBuffer(true),
	'true is not an instance of Number'
)
assert.throws(
	() => type.valueBuffer(1.2),
	'1.2 is not an integer'
)
assert.throws(
	() => type.valueBuffer(Number.MAX_SAFE_INTEGER * 2),
	'18014398509481982 is not an integer'
)
assert.throws(
	() => type.valueBuffer(-1),
	'-1 is negative'
)
assert.throws(
	() => r.value({type, buffer: bufferFrom([])}),
	'Buffer is not long enough'
)
assert.throws(
	() => r.value({type, buffer: bufferFrom([0b11111111])}),
	'Invalid number of bytes'
)
assert.throws(
	() => r.value({type, buffer: bufferFrom([0b10000001])}),
	'Buffer is not long enough'
)