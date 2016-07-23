/*eslint-disable no-undef*/
let s = new Simultaneity;
s.addTask(() => {
	io.readTypeAndValue(new BufferStream(Buffer.from([t.ArrayType._value])), (err, type, value) => {
		assert.message(err, 'Buffer is not long enough');
		assert.equal(type, null);
		assert.equal(value, null);
		s.taskFinished();
	});
});
s.addTask(() => {
	let type = new t.ArrayType(new t.UnsignedShortType);
	let typeValueBuffer = Buffer.concat([
		type.toBuffer(),
		Buffer.from([0, 0, 0, 1])
	]);
	io.readTypeAndValue(new BufferStream(typeValueBuffer), (err, type, value) => {
		assert.message(err, 'Buffer is not long enough');
		assert.equal(type, null);
		assert.equal(value, null);
		s.taskFinished();
	});
});
s.addTask(() => {
	let errorStream = fs.createReadStream(__dirname + '/asdfasdf');
	io.readType(errorStream, (err, type) => {
		assert.message(err, 'ENOENT');
		assert.equal(type, null);
		s.taskFinished();
	});
});
s.addTask(() => {
	let type = new t.StringType;
	let errorStream = fs.createReadStream(__dirname + '/asdfasdf');
	io.readValue({type, inStream: errorStream}, (err, value) => {
		assert.message(err, 'ENOENT');
		assert.equal(value, null);
		s.taskFinished();
	});
});
s.addTask(() => {
	let errorStream = fs.createReadStream(__dirname + '/asdfasdf');
	io.readTypeAndValue(errorStream, (err, type, value) => {
		assert.message(err, 'ENOENT');
		assert.equal(type, null);
		assert.equal(value, null);
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));