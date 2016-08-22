/*eslint-disable no-undef*/
const fs = require('fs')
const OUT_FILE = 'value-out'

let type = new t.TupleType({
	type:
		new t.OptionalType(
			new t.CharType
		),
	length: 5
})
let value = ['a', null, 'b', null, 'c']
let outStream = fs.createWriteStream(OUT_FILE)
const VALUE_BUFFER = bufferFrom([0xff, 0x61, 0x00, 0xff, 0x62, 0x00, 0xff, 0x63])
let s = new Simultaneity
s.addTask(() => {
	io.writeValue({type, value, outStream}, err => {
		if (err) throw err
		fs.readFile(OUT_FILE, (err, data) => {
			if (err) throw err
			assert.equal(data, Buffer.from(VALUE_BUFFER))
			s.taskFinished()
		})
	})
})
s.addTask(() => {
	io.readValue({type, inStream: new BufferStream(VALUE_BUFFER)}, (err, readValue) => {
		assert.equal(err, null)
		assert.equal(readValue, value)
		s.taskFinished()
	})
})
s.addTask(() => {
	io.readValue({type, inStream: new BufferStream(bufferFrom([0x00]))}, (err, readValue) => {
		assert.message(err, 'Buffer is not long enough')
		assert.equal(readValue, null)
		s.taskFinished()
	})
})
let wait = setInterval(() => {}, 10)
s.callback(() => clearInterval(wait))