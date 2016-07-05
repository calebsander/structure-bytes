let type = new t.TupleType(
  new t.BooleanArrayType(), 3
);
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x50, 0x32, 0, 0, 0, 3]));
assert.equal(r.readType(buffer), type);