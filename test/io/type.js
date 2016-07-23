/*eslint-disable no-undef*/
const fs = require('fs');
const OUT_FILE = 'type-out';

let type = new t.ArrayType(
	new t.StructType({
		abc: new t.StringType,
		def: new t.ArrayType(
			new t.ShortType
		)
	})
);
let outStream = fs.createWriteStream(OUT_FILE);
let s = new Simultaneity;
s.addTask(() => {
	io.writeType({type, outStream}, (err) => {
		if (err) throw err;
		let result = fs.readFileSync(OUT_FILE);
		assert.equal(result, Buffer.from([0x52, 0x51, 2, 3, 0x61, 0x62, 0x63, 0x41, 3, 0x64, 0x65, 0x66, 0x52, 0x02]));
		s.taskFinished();
	});
});
s.addTask(() => {
	io.readType(new BufferStream(type.toBuffer()), (err, readType) => {
		if (err) throw err;
		assert.equal(err, null);
		assert.equal(readType, type);
		s.taskFinished();
	});
});
s.addTask(() => {
	io.readType(new BufferStream(Buffer.from([0])), (err, readType) => {
		assert.message(err, 'No such type: 0x00');
		assert.equal(readType, null);
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));