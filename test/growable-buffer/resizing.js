let gb = new GrowableBuffer(0);
for (let i = 0; i < 100000; i++) gb.add(i % 0x100);
let i;
for (i = 0; i < 100000; i++) assert.assert(gb.get(i) === (i % 0x100));
assert.throws(() => gb.get(i));
gb = new GrowableBuffer();
gb.grow(100);
assert.assert(gb.buffer.length === 200);
gb.grow(90);
assert.assert(gb.buffer.length === 200);