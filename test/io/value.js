const fs = require('fs');
const OUT_FILE = 'value-out';

let type = new t.TupleType(
  new t.OptionalType(
    new t.CharType()
  ), 5
);
let value = ['a', null, 'b', null, 'c'];
let outStream = fs.createWriteStream(OUT_FILE);
let ended = false;
io.writeValue(type, value, outStream).on('sb-written', () => {
  let result = fs.readFileSync(OUT_FILE);
  assert.equal(result, Buffer.from([0xff, 0x61, 0x00, 0xff, 0x62, 0x00, 0xff, 0x63]));
  ended = true;
});
let wait = setInterval(() => {
  if (ended) clearInterval(wait);
}, 10);