/*eslint-disable no-undef*/
let type = new t.StringType;
let gb = new GrowableBuffer;
for (let [invalidValue, message] of [
	[undefined, 'undefined is not an instance of String'],
	[null, 'null is not an instance of String'],
	[2, '2 is not an instance of String'],
	[false, 'false is not an instance of String'],
	[['abc'], "[ 'abc' ] is not an instance of String"]
]) {
	assert.throws(
		() => type.writeValue(gb, invalidValue),
		message
	);
}
const STRING = 'abç';
type.writeValue(gb, STRING);
assert.equal(gb.toBuffer(), Buffer.from([0x61, 0x62, 0xc3, 0xa7, 0]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), STRING);