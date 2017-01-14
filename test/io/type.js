/*eslint-disable no-undef, indent*/
const fs = require('fs')
const OUT_FILE = 'type-out'

const type = new t.ArrayType(
	new t.StructType({
		abc: new t.StringType,
		def: new t.ArrayType(
			new t.ShortType
		)
	})
)
const outStream = fs.createWriteStream(OUT_FILE)
const wait = setInterval(() => {}, 10)
new Simultaneity()
	.addTask(s => {
		io.writeType({type, outStream}, err => {
			if (err) throw err
			fs.readFile(OUT_FILE, (err, data) => {
				if (err) throw err
				assert.equal(data, Buffer.from([
					0x52,
						0x51, 2,
							3, 0x61, 0x62, 0x63,
								0x41,
							3, 0x64, 0x65, 0x66,
								0x52,
									0x02
				]))
				fs.unlink(OUT_FILE, err => {
					if (err) throw err
					s.taskFinished()
				})
			})
		})
	})
	.addTask(s => {
		io.readType(new BufferStream(type.toBuffer()), (err, readType) => {
			if (err) throw err
			assert.equal(err, null)
			assert.equal(readType, type)
			s.taskFinished()
		})
	})
	.addTask(s => {
		io.readType(new BufferStream(bufferFrom([0])), (err, readType) => {
			assert.message(err, 'No such type: 0x00')
			assert.equal(readType, null)
			s.taskFinished()
		})
	})
	.callback(() => clearInterval(wait))