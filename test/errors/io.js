/*eslint-disable no-undef*/
let s = new Simultaneity;
s.addTask(() => {
	io.readTypeAndValue(new BufferStream(bufferFrom([t.ArrayType._value])), (err, type, value) => {
		assert.message(err, 'Buffer is not long enough');
		assert.equal(type, null);
		assert.equal(value, null);
		s.taskFinished();
	});
});
s.addTask(() => {
	let type = new t.ArrayType(new t.UnsignedShortType);
	let typeValueBuffer = concat([
		type.toBuffer(),
		bufferFrom([0, 0, 0, 1])
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
let intsType = new t.ArrayType(
	new t.OptionalType(
		new t.UnsignedIntType
	)
);
s.addTask(() => {
	let errorStream = fs.createWriteStream(__dirname + '/asdf/asdf');
	assert.equal(errorStream.writable, true);
	let type = intsType;
	io.writeType({type, outStream: errorStream}, err => {
		assert.message(err, 'ENOENT');
		assert.equal(errorStream.writable, false);
		s.taskFinished();
	});
});
let intsValue = [null, 10, 30, 20, null, 55];
s.addTask(() => {
	let errorStream = fs.createWriteStream(__dirname + '/asdf/asdf');
	assert.equal(errorStream.writable, true);
	let type = intsType;
	let value = intsValue;
	io.writeValue({type, value, outStream: errorStream}, err => {
		assert.message(err, 'ENOENT');
		assert.equal(errorStream.writable, false);
		s.taskFinished();
	});
});
s.addTask(() => {
	let errorStream = fs.createWriteStream(__dirname + '/asdf/asdf');
	assert.equal(errorStream.writable, true);
	let type = intsType;
	let value = intsValue;
	io.writeTypeAndValue({type, value, outStream: errorStream}, err => {
		assert.message(err, 'ENOENT');
		assert.equal(errorStream.writable, false);
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));