import * as fs from 'fs'
import assert from '../../dist/lib/assert'
import BufferStream from '../../lib/buffer-stream'
import * as io from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

const type = new t.TupleType({
	type:
		new t.OptionalType(
			new t.CharType
		),
	length: 5
})
const value = ['a', null, 'b', null, 'c']
const VALUE_BUFFER = bufferFrom([0xff, 0x61, 0x00, 0xff, 0x62, 0x00, 0xff, 0x63])
const writePromise = new Promise((resolve, reject) => {
	const OUT_FILE = 'value-out'
	const outStream = fs.createWriteStream(OUT_FILE)
	io.writeValue({type, value, outStream}, err => {
		try {
			if (err) throw err
			fs.readFile(OUT_FILE, (err, data) => {
				try {
					if (err) throw err
					assert.equal(data, Buffer.from(VALUE_BUFFER))
					fs.unlink(OUT_FILE, _ => resolve())
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})
const writeWithoutCallback = () => new Promise((resolve, reject) => {
	const OUT_FILE = 'value-out2'
	const outStream = fs.createWriteStream(OUT_FILE)
	io.writeValue({type: new t.StringType, value: 'abc', outStream})
	outStream.on('finish', () => {
		try {
			fs.readFile(OUT_FILE, (err, data) => {
				try {
					if (err) throw err
					assert.equal(data, Buffer.from([0x61, 0x62, 0x63, 0]))
					fs.unlink(OUT_FILE, _ => resolve())
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})
const writeErrorPromise = () => new Promise((resolve, reject) => {
	const OUT_FILE = 'value-out3'
	const outStream = fs.createWriteStream(OUT_FILE)
	io.writeValue({type: new t.BooleanType, value: 0 as any, outStream}, err => {
		try {
			assert.errorMessage(err, '0 is not an instance of Boolean')
			fs.unlink(OUT_FILE, _ => resolve())
		}
		catch (e) { reject(e) }
	})
})
const readPromise = new Promise((resolve, reject) => {
	io.readValue({type, inStream: new BufferStream(VALUE_BUFFER)}, (err, readValue) => {
		try {
			assert.equal(err, null)
			assert.equal(readValue, value)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const readErrorPromise = new Promise((resolve, reject) => {
	io.readValue({type, inStream: new BufferStream(bufferFrom([0x00]))}, (err, readValue) => {
		try {
			assert.errorMessage(err, 'Buffer is not long enough')
			assert.equal(readValue, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
export = Promise.all([
	writePromise
		.then(writeWithoutCallback)
		.then(writeErrorPromise),
	readPromise,
	readErrorPromise
])