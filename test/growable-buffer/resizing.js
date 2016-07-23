/*eslint-disable no-undef*/
let gb = new GrowableBuffer(0);
for (let i = 0; i < 100000; i++) gb.add(i % 0x100);
let i;
for (i = 0; i < 100000; i++) assert.equal(gb.get(i), i % 0x100);
assert.throws(
	() => gb.get(i),
	'Index out of bounds: 100000 (100000 is not in [0,100000))'
);
gb = new GrowableBuffer;
assert.equal(gb.buffer.length, 10);
gb.grow(100);
assert.equal(gb.buffer.length, 200);
gb.grow(90);
assert.equal(gb.buffer.length, 200);