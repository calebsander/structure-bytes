let set = new t.SetType(new t.UnsignedLongType());
let optional = new t.OptionalType(set);
assert.equal(optional.toBuffer(), Buffer.from([0x60, 0x53, 0x14]));
assert.equal(r.readType(optional.toBuffer()), optional);