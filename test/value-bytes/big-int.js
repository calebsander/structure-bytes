/*eslint-disable no-undef*/
let type = new t.BigIntType;
const VALUE = '-1234567890';
let buffer = type.valueBuffer(VALUE);
const bytes = [0xb6, 0x69, 0xfd, 0x2e];
assert.equal(buffer, concat([bufferFrom([0, bytes.length]), bufferFrom(bytes)]));
assert.equal(r.value({buffer, type}), VALUE);
buffer = type.valueBuffer('0');
assert.equal(buffer, bufferFill(2, 0));
assert.equal(r.value({buffer, type}), '0');
buffer = type.valueBuffer('-128');
assert.equal(buffer, bufferFrom([0, 1, -128 + 256]));
assert.equal(r.value({buffer, type}), '-128');
buffer = type.valueBuffer('127');
assert.equal(buffer, bufferFrom([0, 1, 127]));
assert.equal(r.value({buffer, type}), '127');
assert.throws(
	() => type.valueBuffer('120971.00'),
	'Illegal strint format: 120971.00'
);