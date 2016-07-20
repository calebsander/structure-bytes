/*eslint-disable no-undef*/
const fs = require('fs');
const OUT_FILE = 'type-value-out';

let type = new t.MapType(new t.StringType, new t.UnsignedIntType);
let value = new Map().set('abc', 123).set('def', 4560).set('—ݥ—', 7512112);
let outStream = fs.createWriteStream(OUT_FILE);
const BUFFER = Buffer.from([0x54, 0x41, 0x13, 0, 0, 0, 3, 0x61, 0x62, 0x63, 0, 0, 0, 0, 0x7b, 0x64, 0x65, 0x66, 0, 0, 0, 0x11, 0xd0, 0xe2, 0x80, 0x94, 0xdd, 0xa5, 0xe2, 0x80, 0x94, 0, 0, 0x72, 0xa0, 0x30]);
let s = new Simultaneity;
s.addTask(() => {
	io.writeTypeAndValue({type, value, outStream}).on('sb-written', () => {
		fs.readFile(OUT_FILE, (err, data) => {
			if (err) throw err;
			assert.equal(data, BUFFER);
			s.taskFinished();
		});
	});
});
s.addTask(() => {
	io.readTypeAndValue(new BufferStream(BUFFER), (err, readValue) => {
		assert.equal(err, null);
		assert.equal(readValue, value);
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));