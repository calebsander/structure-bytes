/*eslint-disable no-undef*/
assert.throws(() => t.Type._value);
let type = new t.Type;
assert.throws(() => type.valueBuffer(23));
assert.equal(new t.UnsignedIntType().equals(new t.UnsignedLongType), false);
assert.equal(new t.BooleanTupleType(5).equals(new t.BooleanTupleType(6)), false);