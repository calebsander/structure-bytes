/*eslint-disable no-undef*/
const type = new t.BigUnsignedIntType
const VALUE = '81129638414606663681390495662081'
const buffer = type.valueBuffer(VALUE)
const bytes = [0x3, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]
assert.equal(buffer, concat([bufferFrom([bytes.length]), bufferFrom(bytes)]))
assert.equal(r.value({buffer, type}), VALUE)

const buffer2 = type.valueBuffer('0')
assert.equal(buffer2, bufferFrom([0]))
assert.equal(r.value({buffer: buffer2, type}), '0')

assert.throws(
	() => type.valueBuffer('120971.00'),
	'Illegal strint format: 120971.00'
)
assert.throws(
	() => type.valueBuffer('-1'),
	'Value out of range'
)