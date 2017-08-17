import * as fs from 'fs'
import assert from '../../dist/lib/assert'
import BufferStream from '../../dist/lib/buffer-stream'
import * as io from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

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
const writePromise = new Promise((resolve, reject) => {
	io.writeType({type, outStream}, err => {
		try {
			if (err) throw err
			fs.readFile(OUT_FILE, (err, data) => {
				try {
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
	io.readType(new BufferStream(type.toBuffer()), (err, readType) => {
		try {
			if (err) throw err
			assert.equal(err, null)
			assert.equal(readType, type)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const readErrorPromise = new Promise((resolve, reject) => {
	io.readType(new BufferStream(bufferFrom([0])), (err, readType) => {
		try {
			assert.errorMessage(err, 'No such type: 0x00')
			assert.equal(readType, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
export = Promise.all([writePromise, readPromise, readErrorPromise])