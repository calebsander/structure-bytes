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
				0, 0, 0, 30,
			0x64, 0x65, 0x66, 0,
				0, 0, 0, 30,
			0xe2, 0x80, 0x94, 0xdd, 0xa5, 0xe2, 0x80, 0x94, 0,
				0, 0, 0, 30,
		0, 0, 0x11, 0xd0
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
					fs.unlink(OUT_FILE, err => {
						try {
							if (err) throw err
							resolve()
						}
						catch (e) { reject(e) }
					})
				}
				catch (e) { reject(e) }
			})
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
export = Promise.all([writePromise, readPromise])