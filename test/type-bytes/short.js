let type = new t.ShortType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x02]));
assert.equal(r.readType(buffer), new t.ShortType());