/*eslint-disable no-undef*/
const wait = setInterval(() => {}, 10)
const s = new Simultaneity()
	.addTask(s => {
		io.readTypeAndValue(new BufferStream(bufferFrom([t.ArrayType._value])), (err, type, value) => {
			assert.message(err, 'Buffer is not long enough')
			assert.equal(type, null)
			assert.equal(value, null)
			s.taskFinished()
		})
	})
	.addTask(s => {
		const type = new t.ArrayType(new t.UnsignedShortType)
		const typeValueBuffer = concat([
			type.toBuffer(),
			bufferFrom([1])
		])
		io.readTypeAndValue(new BufferStream(typeValueBuffer), (err, type, value) => {
			assert.message(err, 'Buffer is not long enough')
			assert.equal(type, null)
			assert.equal(value, null)
			s.taskFinished()
		})
	})
	.addTask(s => {
		const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
		io.readType(errorStream, (err, type) => {
			assert.message(err, 'ENOENT')
			assert.equal(type, null)
			s.taskFinished()
		})
	})
	.addTask(s => {
		const type = new t.StringType
		const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
		io.readValue({type, inStream: errorStream}, (err, value) => {
			assert.message(err, 'ENOENT')
			assert.equal(value, null)
			s.taskFinished()
		})
	})
	.addTask(s => {
		const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
		io.readTypeAndValue(errorStream, (err, type, value) => {
			assert.message(err, 'ENOENT')
			assert.equal(type, null)
			assert.equal(value, null)
			s.taskFinished()
		})
	})
const intsType = new t.ArrayType(
	new t.OptionalType(
		new t.UnsignedIntType
	)
)
s.addTask(s => {
	const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
	assert.equal(errorStream.writable, true)
	io.writeType({
		type: intsType,
		outStream: errorStream
	}, err => {
		assert.message(err, 'ENOENT')
		assert.equal(errorStream.writable, false)
		s.taskFinished()
	})
})
const intsValue = [null, 10, 30, 20, null, 55]
s
	.addTask(s => {
		const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
		assert.equal(errorStream.writable, true)
		io.writeValue({
			type: intsType,
			value: intsValue,
			outStream: errorStream
		}, err => {
			assert.message(err, 'ENOENT')
			assert.equal(errorStream.writable, false)
			s.taskFinished()
		})
	})
	.addTask(s => {
		const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
		assert.equal(errorStream.writable, true)
		io.writeTypeAndValue({
			type: intsType,
			value: intsValue,
			outStream: errorStream
		}, err => {
			assert.message(err, 'ENOENT')
			assert.equal(errorStream.writable, false)
			s.taskFinished()
		})
	})
	.callback(() => clearInterval(wait))