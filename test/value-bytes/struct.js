let type = new t.StructType([
  {name: 's', type: new t.StringType()},
  {name: 'b', type: new t.BooleanArrayType()},
  {name: 'i', type: new t.UnsignedIntType()}
]);
let gb = new GrowableBuffer();
assert.throws(() => {
  type.writeValue(gb, {});
});
type.writeValue(gb, {
  s: 'àßçðê',
  b: [true, false, true],
  i: 675
});
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 10, 0xc3, 0xa0, 0xc3, 0x9f, 0xc3, 0xa7, 0xc3, 0xb0, 0xc3, 0xaa, 0, 0, 0, 3, 0b10100000, 0x00, 0x00, 0x02, 0xa3])));