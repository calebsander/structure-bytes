/*eslint-disable no-undef*/
const type = new t.BigIntType
const VALUE = '-1234567890'
const buffer = type.valueBuffer(VALUE)
const bytes = [0xb6, 0x69, 0xfd, 0x2e]
assert.equal(buffer, concat([
	bufferFrom([bytes.length]),
	bufferFrom(bytes)
]))
assert.equal(r.value({buffer, type}), VALUE)

const buffer2 = type.valueBuffer('0')
assert.equal(buffer2, bufferFrom([0]))
assert.equal(r.value({buffer: buffer2, type}), '0')

const buffer3 = type.valueBuffer('-128')
assert.equal(buffer3, bufferFrom([1, -128 + 256]))
assert.equal(r.value({buffer: buffer3, type}), '-128')

const buffer4 = type.valueBuffer('127')
assert.equal(buffer4, bufferFrom([1, 127]))
assert.equal(r.value({buffer: buffer4, type}), '127')

assert.throws(
	() => type.valueBuffer('120971.00'),
	'Illegal strint format: 120971.00'
)