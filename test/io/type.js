const fs = require('fs');
const OUT_FILE = 'type-out';

let type = new t.ArrayType(
  new t.StructType({
    abc: new t.StringType(),
    def: new t.ArrayType(
      new t.ShortType()
    )
  })
);
let outStream = fs.createWriteStream(OUT_FILE);
let ended = false;
io.writeType(type, outStream).on('sb-written', () => {
  let result = fs.readFileSync(OUT_FILE);
  assert.equal(result, Buffer.from([0x52, 0x51, 2, 3, 0x61, 0x62, 0x63, 0x41, 3, 0x64, 0x65, 0x66, 0x52, 0x02]));
  ended = true;
});
let wait = setInterval(() => {
  if (ended) clearInterval(wait);
}, 10);