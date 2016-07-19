let type = new t.StringType;
let gb = new GrowableBuffer;
for (let invalidValue of [undefined, null, 2, false, ['abc']]) {
	assert.throws(() => {
		type.writeValue(gb, invalidValue);
	});
}
const STRING = 'abç';
type.writeValue(gb, STRING);
assert.equal(gb.toBuffer(), Buffer.from([0x61, 0x62, 0xc3, 0xa7, 0]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), STRING);