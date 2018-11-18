import * as fs from 'fs'
import {promisify} from 'util'
import BufferStream from '../../lib/buffer-stream'
import * as io from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

const type = new t.TupleType({
	type: new t.OptionalType(
		new t.CharType
	),
	length: 5
})
const value = ['a', null, 'b', null, 'c']
const VALUE_BUFFER = bufferFrom([0xff, 0x61, 0x00, 0xff, 0x62, 0x00, 0xff, 0x63])
const writePromise = (() => {
	const OUT_FILE = 'value-out'
	const outStream = fs.createWriteStream(OUT_FILE)
	return promisify(io.writeValue)({type, value, outStream})
		.then(_ => promisify(fs.readFile)(OUT_FILE))
		.then(data => assert.deepEqual(data, Buffer.from(VALUE_BUFFER)))
		.then(_ => promisify(fs.unlink)(OUT_FILE))
})()
const writeWithoutCallback = new Promise<void>((resolve, reject) => {
	const OUT_FILE = 'value-out2'
	const outStream = fs.createWriteStream(OUT_FILE)
	outStream.on('finish', () => {
		try {
			resolve(
				promisify(fs.readFile)(OUT_FILE)
					.then(data => assert.deepEqual(data, Buffer.from([0x61, 0x62, 0x63, 0])))
					.then(_ => promisify(fs.unlink)(OUT_FILE))
			)
		}
		catch (e) { reject(e) }
	})
	io.writeValue({type: new t.StringType, value: 'abc', outStream})
})
const writeErrorPromise = (() => {
	const OUT_FILE = 'value-out3'
	const outStream = fs.createWriteStream(OUT_FILE)
	return promisify(io.writeValue)({
		type: new t.BooleanType,
		value: 0 as any,
		outStream
	})
		.then(_ => { throw new Error('Expected error to be thrown') })
		.catch(err => assert(err.message === '0 is not an instance of Boolean'))
		.then(_ => promisify(fs.unlink)(OUT_FILE))
})()
const pauseWrite = (() => {
	const OUT_FILE = 'value-out4'
	const outStream = fs.createWriteStream(OUT_FILE)
	const type = new t.ArrayType(
		new t.ChoiceType<boolean | boolean[] | string>([
			new t.BooleanType,
			new t.BooleanArrayType,
			new t.StringType
		])
	)
	const value = [
		[true, true, false],
		'abc',
		false
	]
	return promisify(io.writeValue)({type, value, outStream})
		.then(_ => promisify(fs.readFile)(OUT_FILE))
		.then(data =>
			assert.deepEqual(data, Buffer.from([
				3,
					1,
						3, 0b11000000,
					2,
						0x61, 0x62, 0x63, 0,
					0,
						0x00
			]))
		)
		.then(_ => promisify(fs.unlink)(OUT_FILE))
})()
const readPromise = promisify(io.readValue)({type, inStream: new BufferStream(VALUE_BUFFER)})
	.then(readValue => assert.deepEqual(readValue, value))
const readErrorPromise = promisify(io.readValue)({
	type,
	inStream: new BufferStream(bufferFrom([0x00]))
})
	.then(_ => { throw new Error('Expected error to be thrown') })
	.catch(err => assert(err.message === 'Buffer is not long enough'))
export = Promise.all([
	writePromise,
	writeWithoutCallback,
	writeErrorPromise,
	pauseWrite,
	readPromise,
	readErrorPromise
])