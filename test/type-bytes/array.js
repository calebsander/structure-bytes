let array = new t.ArrayType(
  new t.UnsignedIntType()
);
assert.assert(array.toBuffer().equals(Buffer.from([0x52, 0x13])));