const fs = require('fs');
const OUT_FILE = 'type-value-out';

let type = new t.MapType(new t.StringType(), new t.UnsignedIntType());
let value = new Map().set('abc', 123).set('def', 4560).set('—ݥ—', 7512112);
let outStream = fs.createWriteStream(OUT_FILE);
let ended = false;
io.writeTypeAndValue(type, value, outStream).on('finish', () => {
  let result = fs.readFileSync(OUT_FILE);
  assert.assert(result.equals(Buffer.from([0x54, 0x41, 0x13, 0, 0, 0, 3, 0, 0, 0, 3, 0x61, 0x62, 0x63, 0, 0, 0, 0x7b, 0, 0, 0, 3, 0x64, 0x65, 0x66, 0, 0, 0x11, 0xd0, 0, 0, 0, 8, 0xe2, 0x80, 0x94, 0xdd, 0xa5, 0xe2, 0x80, 0x94, 0, 0x72, 0xa0, 0x30])));
  ended = true;
});
let wait = setInterval(() => {
  if (ended) clearInterval(wait);
}, 10);