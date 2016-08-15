/*eslint-disable no-undef*/
let type = new t.BigUnsignedIntType;
const VALUE = '81129638414606663681390495662081';
let buffer = type.valueBuffer(VALUE);
const bytes = [0x3, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
assert.equal(buffer, concat([bufferFrom([0, bytes.length]), bufferFrom(bytes)]));
assert.equal(r.value({buffer, type}), VALUE);
buffer = type.valueBuffer('0');
assert.equal(buffer, bufferFill(2, 0));
assert.equal(r.value({buffer, type}), '0');
assert.throws(
	() => type.valueBuffer('120971.00'),
	'Illegal strint format: 120971.00'
);
assert.throws(
	() => type.valueBuffer('-1'),
	'Value out of range'
);