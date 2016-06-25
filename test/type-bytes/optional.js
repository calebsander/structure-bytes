let set = new t.SetType(new t.UnsignedLongType());
let optional = new t.OptionalType(set);
assert.assert(optional.toBuffer().equals(Buffer.from([0x60, 0x53, 0x14])));