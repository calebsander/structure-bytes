/*eslint-disable no-undef*/
let s = new Simultaneity;
s.addTask(() => {
	io.readTypeAndValue(new BufferStream(Buffer.from([t.ArrayType._value])), (err, type, value) => {
		assert.assert(err, 'No error thrown');
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
		assert.assert(err, 'No error thrown');
		assert.equal(type, null);
		assert.equal(value, null);
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));