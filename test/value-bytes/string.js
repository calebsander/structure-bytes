let type = new t.StringType();
let gb = new GrowableBuffer();
for (let invalidValue of [undefined, null, 2, false, ['abc']]) {
  assert.throws(() => {
    type.writeValue(gb, invalidValue);
  });
}
type.writeValue(gb, 'abç');
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 4, 0x61, 0x62, 0xc3, 0xa7])));