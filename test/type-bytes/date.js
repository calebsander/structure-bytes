let type = new t.DateType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x15]));