let type = new t.TupleType(new t.StringType(), 5);
let gb = new GrowableBuffer();
for (let invalidValue of [undefined, null, 'abcde', 7, true, [1, 2, 3, 4, 5], ['a', 'b', 'c', 'd', 5]]) {
	assert.throws(() => {
		type.writeValue(gb, invalidValue);
	});
}
gb = new GrowableBuffer();
type.writeValue(gb, [
	'',
	'a',
	'ab',
	'abc',
	'abcd'
]);
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0x61, 0, 0x61, 0x62, 0, 0x61, 0x62, 0x63, 0, 0x61, 0x62, 0x63, 0x64, 0])))