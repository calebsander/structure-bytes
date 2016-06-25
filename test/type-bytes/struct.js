let struct = new t.StructType([
  {name: 'bobbé', type: new t.BooleanType()},
  {name: '', type: new t.IntType()}
]);
assert.assert(struct.toBuffer().equals(Buffer.from([0x51, 2, 6, 0x62, 0x6f, 0x62, 0x62, 0xc3, 0xa9, 0x30, 0, 0x03])));