import * as fs from 'fs'
import {promisify} from 'util'
import BufferStream from '../../lib/buffer-stream'
import * as io from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom, concat} from '../test-common'

const type = new t.MapType(new t.StringType, new t.PointerType(new t.UnsignedIntType))
const value = new Map<string, number>().set('abc', 4560).set('def', 4560).set('—ݥ—', 4560)
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
const writePromise = (() => {
	const OUT_FILE = 'type-value-out'
	const outStream = fs.createWriteStream(OUT_FILE)
	return promisify(io.writeTypeAndValue)({type, value, outStream})
		.then(_ => promisify(fs.readFile)(OUT_FILE))
		.then(data => assert.deepEqual(data, Buffer.from(BUFFER)))
		.then(_ => promisify(fs.unlink)(OUT_FILE))
})()
const writeWithoutCallback = new Promise<void>((resolve, reject) => {
	const OUT_FILE = 'type-value-out2'
	const outStream = fs.createWriteStream(OUT_FILE)
	outStream.on('finish', () => {
		try {
			resolve(
				promisify(fs.readFile)(OUT_FILE)
					.then(data =>
						assert.deepEqual(data, Buffer.from([0x41, 0x61, 0x62, 0x63, 0]))
					)
					.then(_ => promisify(fs.unlink)(OUT_FILE))
			)
		}
		catch (e) { reject(e) }
	})
	io.writeTypeAndValue({type: new t.StringType, value: 'abc', outStream})
})
const writeTypeErrorPromise = (() => {
	const OUT_FILE = 'type-value-out3'
	const outStream = fs.createWriteStream(OUT_FILE)
	return promisify(io.writeTypeAndValue)<number>({
		type: new t.RecursiveType('no-such-type'),
		value: 0,
		outStream
	})
		.then(_ => { throw new Error('Expected error to be thrown') })
		.catch(err => assert(err.message === '"no-such-type" is not a registered type'))
		.then(_ => promisify(fs.unlink)(OUT_FILE))
})()
const writeValueErrorPromise = (() => {
	const OUT_FILE = 'type-value-out4'
	const outStream = fs.createWriteStream(OUT_FILE)
	return promisify(io.writeTypeAndValue)({type: new t.UnsignedIntType, value: -1, outStream})
		.then(_ => { throw new Error('Expected error to be thrown') })
		.catch(err =>
			assert(err.message === 'Value out of range (-1 is not in [0,4294967296))')
		)
		.then(_ => promisify(fs.unlink)(OUT_FILE))
})()
const readPromise = promisify(io.readTypeAndValue)<Map<string, number>>(new BufferStream(BUFFER))
	.then(({type: readType, value: readValue}) => {
		assert(type.equals(readType))
		assert.deepEqual(readValue, value)
	})
const readErrorPromise = promisify(io.readTypeAndValue)<string>(
	new BufferStream(bufferFrom([0x41, 0x61, 0x62, 0x63]))
)
	.then(_ => { throw new Error('Expected error to be thrown') })
	.catch(err => assert(err.message === 'Buffer is not long enough'))
export = Promise.all([
	writePromise,
	writeWithoutCallback,
	writeTypeErrorPromise,
	writeValueErrorPromise,
	readPromise,
	readErrorPromise
])