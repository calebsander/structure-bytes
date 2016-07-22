/*eslint-disable no-undef*/
let tooManyValues = new Array(256);
for (let i = 0; i < tooManyValues.length; i++) tooManyValues[i] = 'A'.repeat(i);
for (let invalidValues of ['asdf', [2], [true], [undefined], ['abc', 3], ['1', '2', '1'], tooManyValues]) {
	assert.throws(() => {
		new t.EnumType({
			type: new t.StringType,
			values: invalidValues
		});
	});
}
let type = new t.EnumType({
	type: new t.StringType,
	values: [
		'ABC',
		'DEF',
		'GHI'
	]
});
assert.equal(type.toBuffer(), Buffer.from([0x55, 0x41, 3, 0x41, 0x42, 0x43, 0, 0x44, 0x45, 0x46, 0, 0x47, 0x48, 0x49, 0]));
assert.equal(r.type(type.toBuffer()), type);