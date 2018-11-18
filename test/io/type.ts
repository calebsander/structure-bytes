import * as fs from 'fs'
import {promisify} from 'util'
import BufferStream from '../../lib/buffer-stream'
import * as io from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

type Value = {abc: string, def: number[]}[]
const type: t.Type<Value> = new t.ArrayType(
	new t.StructType({
		abc: new t.StringType,
		def: new t.ArrayType(
			new t.ShortType
		)
	})
)
const writePromise = (() => {
	const OUT_FILE = 'type-out'
	const outStream = fs.createWriteStream(OUT_FILE)
	return promisify(io.writeType)({type, outStream})
		.then(_ => promisify(fs.readFile)(OUT_FILE))
		.then(data =>
			assert.deepEqual(data, Buffer.from([
				0x52,
					0x51, 2,
						3, 0x61, 0x62, 0x63,
							0x41,
						3, 0x64, 0x65, 0x66,
							0x52,
								0x02
			]))
		)
		.then(_ => promisify(fs.unlink)(OUT_FILE))
})()
const writeWithoutCallback = new Promise<void>((resolve, reject) => {
	const OUT_FILE = 'type-out2'
	const outStream = fs.createWriteStream(OUT_FILE)
	outStream.on('finish', () => {
		try {
			resolve(
				promisify(fs.readFile)(OUT_FILE)
					.then(data => assert.deepEqual(data, Buffer.from([0x41])))
					.then(_ => promisify(fs.unlink)(OUT_FILE))
			)
		}
		catch (e) { reject(e) }
	})
	io.writeType({type: new t.StringType, outStream})
})
const writeErrorPromise = (() => {
	const OUT_FILE = 'type-out3'
	const outStream = fs.createWriteStream(OUT_FILE)
	return promisify(io.writeType)({
		type: new t.RecursiveType('no-such-type'),
		outStream
	})
		.then(_ => { throw new Error('Expected error to be thrown') })
		.catch(err => assert(err.message === '"no-such-type" is not a registered type'))
		.then(_ => promisify(fs.unlink)(OUT_FILE))
})()
const readPromise = promisify(io.readType)<Value>(new BufferStream(type.toBuffer()))
	.then(readType => assert(type.equals(readType)))
const readErrorPromise = promisify(io.readType)(new BufferStream(bufferFrom([0])))
	.then(_ => { throw new Error('Expected error to be thrown') })
	.catch(err => assert(err.message === 'No such type: 0x00'))
export = Promise.all([
	writePromise,
	writeWithoutCallback,
	writeErrorPromise,
	readPromise,
	readErrorPromise
])