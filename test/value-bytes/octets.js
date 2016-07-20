/*eslint-disable no-undef*/
let type = new t.OctetsType;
let gb = new GrowableBuffer;
let VALUE = Buffer.from([0xc1, 0xb5, 0x4c, 0x97, 0x9e, 0x9a, 0xde, 0x5b, 0x46, 0xf5, 0x1a, 0x4a, 0xbb, 0x47, 0xbd, 0x78, 0x84, 0xe7, 0x80, 0xb, 0x9, 0xa9, 0x58, 0x26, 0x8b, 0x1b, 0x64, 0xb5, 0x29, 0xf8, 0x58, 0x3a, 0x72, 0x96, 0x4a, 0x6e, 0x4e, 0x44, 0x97, 0xf0, 0xa9, 0xf6, 0xed, 0x3b, 0x91, 0x8, 0x5b, 0x65, 0x75, 0x28, 0x4d, 0x2d, 0x39, 0xa1, 0x5a, 0xc1, 0xd4, 0x28, 0xb7, 0xa9, 0x2a, 0xac, 0xcc, 0x45, 0x3d, 0x25, 0x3a, 0x5b, 0x3e, 0xfc, 0xcb, 0xd2, 0xaf, 0x62, 0x7e, 0x90, 0x7f, 0x1b, 0x52, 0xd1, 0x36, 0x8d, 0x16, 0xd2, 0xe, 0x3d, 0x1f, 0x9a, 0x4e, 0xc3, 0xd4, 0xa4, 0xac, 0x7e, 0xcd, 0xcf, 0x68, 0x8d, 0xdb, 0x7b]);
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.concat([Buffer.from([0, 0, 0, 100]), VALUE]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);
assert.throws(() => r.value({buffer: Buffer.from([0, 0, 0, 1]), type}));