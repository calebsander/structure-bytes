/*eslint-disable no-undef*/
const fs = require('fs');
const OUT_FILE = 'value-out';

let type = new t.TupleType({
	type:
		new t.OptionalType(
			new t.CharType
		),
	length: 5
});
let value = ['a', null, 'b', null, 'c'];
let outStream = fs.createWriteStream(OUT_FILE);
const VALUE_BUFFER = Buffer.from([0xff, 0x61, 0x00, 0xff, 0x62, 0x00, 0xff, 0x63]);
let s = new Simultaneity;
s.addTask(() => {
	io.writeValue({type, value, outStream}, (err) => {
		if (err) throw err;
		let result = fs.readFileSync(OUT_FILE);
		assert.equal(result, VALUE_BUFFER);
		s.taskFinished();
	});
});
s.addTask(() => {
	io.readValue({type, inStream: new BufferStream(VALUE_BUFFER)}, (err, readValue) => {
		assert.equal(err, null);
		assert.equal(readValue, value);
		s.taskFinished();
	});
});
s.addTask(() => {
	io.readValue({type, inStream: new BufferStream(Buffer.from([0x00]))}, (err, readValue) => {
		assert.assert(err, 'No error occurred');
		assert.equal(readValue, null);
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));