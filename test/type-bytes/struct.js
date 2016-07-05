let struct = new t.StructType({
	'bobbé': new t.BooleanType(),
	'': new t.IntType()
});
let buffer = struct.toBuffer();
assert.equal(buffer, Buffer.from([0x51, 2, 0, 0x03, 6, 0x62, 0x6f, 0x62, 0x62, 0xc3, 0xa9, 0x30]));
assert.equal(r.readType(buffer), struct);
for (let i = 0; i < buffer.length; i++) {
  assert.throws(() => r.readType(buffer.slice(0, i)));
}

assert.throws(() => {
	let struct = {};
	for (let i = 1; i <= 256; i++) struct[((i % 2) ? 'a' : 'b').repeat(Math.floor(i / 2))] = new t.IntType();
	new t.StructType(struct);
});