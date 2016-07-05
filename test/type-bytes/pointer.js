let pointer = new t.PointerType(new t.LongType());
assert.equal(pointer.toBuffer(), Buffer.from([0x70, 0x04]));
assert.equal(r.readType(pointer.toBuffer()), pointer);