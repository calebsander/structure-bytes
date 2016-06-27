let gb = new GrowableBuffer();
for (let i = 0; i < 10; i++) gb.addAll(Buffer.from('abc'));
let gb2 = new GrowableBuffer();
gb2.addAll(Buffer.from('abc'.repeat(10)));
assert.assert(gb.toBuffer().equals(gb2.toBuffer()));
gb = new GrowableBuffer();
for (let i = 0; i < 100; i++) {
  assert.throws(() => gb.set(i, i));
  gb.add(i);
}
let buffer = Buffer.alloc(4, 0xbe);
for (let i = 0; i < 100; i++) {
  if (i > 96) assert.throws(() => gb.setAll(i, buffer));
  else gb.setAll(i, buffer);
}
for (let i = 0; i < gb.length; i++) assert.assert(gb.get(i) === 0xbe);