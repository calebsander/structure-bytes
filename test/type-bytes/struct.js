let struct = new t.StructType({
	'bobbé': new t.BooleanType(),
	'': new t.IntType()
});
assert.equal(struct.toBuffer(), Buffer.from([0x51, 2, 0, 0x03, 6, 0x62, 0x6f, 0x62, 0x62, 0xc3, 0xa9, 0x30]));

assert.throws(() => {
	let struct = {};
	for (let i = 1; i <= 256; i++) struct[((i % 2) ? 'a' : 'b').repeat(Math.floor(i / 2))] = new t.IntType();
	new t.StructType(struct);
});