let type = new t.OctetsType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x42]));
assert.equal(r.type(buffer), new t.OctetsType());