let type = new t.ShortType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x02]));
assert.instanceOf(r.readType(buffer), t.ShortType);