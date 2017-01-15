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

//For some reason, makeMaxBuffer does not get defined if this is not in a separate block
{ //eslint-disable-line no-lone-blocks
	function makeMinBuffer(bytes) {
		const fullBytes = new Array(bytes - 1)
		fullBytes.fill(0b00000000)
		return bufferFrom(
			[parseInt('1'.repeat(bytes - 1) + '0'.repeat(9 - bytes), 2)]
			.concat(fullBytes)
		)
	}
	function makeMaxBuffer(bytes) {
		const fullBytes = new Array(bytes - 1)
		fullBytes.fill(0b11111111)
		return bufferFrom(
			[parseInt('1'.repeat(bytes - 1) + '0' + '1'.repeat(8 - bytes), 2)]
			.concat(fullBytes)
		)
	}
	assert.equal(type.valueBuffer(2113663), makeMaxBuffer(3))
	assert.equal(type.valueBuffer(2113664), makeMinBuffer(4))
	assert.equal(type.valueBuffer(270549119), makeMaxBuffer(4))
	assert.equal(type.valueBuffer(270549120), makeMinBuffer(5))
	assert.equal(type.valueBuffer(34630287487), makeMaxBuffer(5))
	assert.equal(type.valueBuffer(34630287488), makeMinBuffer(6))
	assert.equal(type.valueBuffer(4432676798591), makeMaxBuffer(6))
	assert.equal(type.valueBuffer(4432676798592), makeMinBuffer(7))
	assert.equal(type.valueBuffer(567382630219903), makeMaxBuffer(7))
	assert.equal(type.valueBuffer(567382630219904), makeMinBuffer(8))
	assert.equal(type.valueBuffer(Number.MAX_SAFE_INTEGER), bufferFrom([0b11111110, 0b00011101, 0b11111011, 0b11110111, 0b11101111, 0b11011111, 0b10111111, 0b01111111]))
	assert.equal(r.value({type, buffer: type.valueBuffer(Number.MAX_SAFE_INTEGER)}), Number.MAX_SAFE_INTEGER)
	assert.equal(type.valueBuffer('123'), bufferFrom([123]))
}

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