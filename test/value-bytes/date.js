let type = new t.DateType();
let gb = new GrowableBuffer();
const VALUE = new Date(1468516005643);
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0x01, 0x55, 0xea, 0x5f, 0xf7, 0x0b]));