import * as fs from 'fs'
import assert from '../../dist/lib/assert'
import BufferStream from '../../dist/lib/buffer-stream'
import * as io from '../../dist'
import * as t from '../../dist'
import {bufferFrom, concat} from '../test-common'

const OUT_FILE = 'type-value-out'

const type = new t.MapType(new t.StringType, new t.PointerType(new t.UnsignedIntType))
const value = new Map().set('abc', 4560).set('def', 4560).set('—ݥ—', 4560)
const outStream = fs.createWriteStream(OUT_FILE)
const BUFFER = concat([
	bufferFrom([0x54, 0x41, 0x70, 0x13]),
	bufferFrom([
		3,
			0x61, 0x62, 0x63, 0,
				0,
					0, 0, 0x11, 0xd0,
			0x64, 0x65, 0x66, 0,
				9,
			0xe2, 0x80, 0x94, 0xdd, 0xa5, 0xe2, 0x80, 0x94, 0,
				10
	])
])
const writePromise = new Promise((resolve, reject) => {
	io.writeTypeAndValue({type, value, outStream}, err => {
		try {
			if (err) throw err
			fs.readFile(OUT_FILE, (err, data) => {
				try {
					if (err) throw err
					assert.equal(data, Buffer.from(BUFFER))
					fs.unlink(OUT_FILE, _ => resolve())
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})
const writeWithoutCallback = () => new Promise((resolve, reject) => {
	const wait = setTimeout(() => {}, 1000000)
	const outStream = fs.createWriteStream(OUT_FILE)
	io.writeTypeAndValue({type: new t.StringType, value: 'abc', outStream})
	outStream.on('finish', () => {
		clearTimeout(wait)
		try {
			fs.readFile(OUT_FILE, (err, data) => {
				try {
					if (err) throw err
					assert.equal(data, Buffer.from([0x41, 0x61, 0x62, 0x63, 0]))
					fs.unlink(OUT_FILE, _ => resolve())
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})
const writeTypeErrorPromise = () => new Promise((resolve, reject) => {
	const outStream = fs.createWriteStream(OUT_FILE)
	io.writeTypeAndValue({type: new t.RecursiveType('no-such-type'), value: 0, outStream}, err => {
		try {
			assert.errorMessage(err, '"no-such-type" is not a registered type')
			fs.unlink(OUT_FILE, _ => resolve())
		}
		catch (e) { reject(e) }
	})
})
const writeValueErrorPromise = () => new Promise((resolve, reject) => {
	const outStream = fs.createWriteStream(OUT_FILE)
	io.writeTypeAndValue({type: new t.UnsignedIntType, value: -1, outStream}, err => {
		try {
			assert.errorMessage(err, 'Value out of range (-1 is not in [0,4294967296))')
			fs.unlink(OUT_FILE, _ => resolve())
		}
		catch (e) { reject(e) }
	})
})
const readPromise = new Promise((resolve, reject) => {
	io.readTypeAndValue(new BufferStream(BUFFER), (err, readType, readValue) => {
		try {
			assert.equal(err, null)
			assert.equal(readType, type)
			assert.equal(readValue, value)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
export = Promise.all([
	writePromise
		.then(writeWithoutCallback)
		.then(writeTypeErrorPromise)
		.then(writeValueErrorPromise),
	readPromise
])