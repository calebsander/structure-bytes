let pointer = new t.PointerType(new t.LongType());
assert.assert(pointer.toBuffer().equals(Buffer.from([0x70, 0x04])));