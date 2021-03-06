import * as fs from 'fs'
import BufferStream from '../../lib/buffer-stream'
import * as io from '../../dist'
import * as t from '../../dist'
import {assert, concat} from '../test-common'

const invalidTypeBuffer = new Promise<void>((resolve, reject) => {
	io.readTypeAndValue(
		new BufferStream(new Uint8Array([t.ArrayType._value])),
		(err, type, value) => {
			try {
				assert(err && err.message === 'Buffer is not long enough')
				assert.equal(type, null)
				assert.equal(value, null)
				resolve()
			}
			catch (e) { reject(e) }
		}
	)
})
const tooLongTypeBuffer = new Promise<void>((resolve, reject) => {
	const type = new t.ArrayType(new t.UnsignedShortType)
	const typeValueBuffer = concat([
		new Uint8Array(type.toBuffer()),
		new Uint8Array([1])
	])
	io.readTypeAndValue(new BufferStream(typeValueBuffer), (err, type, value) => {
		try {
			assert(err && err.message === 'Buffer is not long enough')
			assert.equal(type, null)
			assert.equal(value, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const enoentType = new Promise<void>((resolve, reject) => {
	const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
	io.readType(errorStream, (err, type) => {
		try {
			assert(err && err.message.startsWith('ENOENT'))
			assert.equal(type, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const enoentValue = new Promise<void>((resolve, reject) => {
	const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
	io.readValue({type: new t.ByteType, inStream: errorStream}, (err, type) => {
		try {
			assert(err && err.message.startsWith('ENOENT'))
			assert.equal(type, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const enoentTypeAndValue = new Promise<void>((resolve, reject) => {
	const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
	io.readTypeAndValue(errorStream, (err, type) => {
		try {
			assert(err && err.message.startsWith('ENOENT'))
			assert.equal(type, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const intsType = new t.ArrayType(
	new t.OptionalType(
		new t.UnsignedIntType
	)
)
const enoentWriteType = new Promise<void>((resolve, reject) => {
	const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
	assert.equal(errorStream.writable, true)
	io.writeType({
		type: intsType,
		outStream: errorStream
	}, err => {
		try {
			assert(err && err.message.startsWith('ENOENT'))
			assert.equal(errorStream.writable, false)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const intsValue = [null, 10, 30, 20, null, 55]
const enoentWriteValue = new Promise<void>((resolve, reject) => {
	const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
	assert.equal(errorStream.writable, true)
	io.writeValue({
		type: intsType,
		value: intsValue,
		outStream: errorStream
	}, err => {
		try {
			assert(err && err.message.startsWith('ENOENT'))
			assert.equal(errorStream.writable, false)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const enoentWriteTypeAndValue = new Promise<void>((resolve, reject) => {
	const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
	assert.equal(errorStream.writable, true)
	io.writeTypeAndValue({
		type: intsType,
		value: intsValue,
		outStream: errorStream
	}, err => {
		try {
			assert(err && err.message.startsWith('ENOENT'))
			assert.equal(errorStream.writable, false)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
export = Promise.all([
	invalidTypeBuffer,
	tooLongTypeBuffer,
	enoentType,
	enoentValue,
	enoentTypeAndValue,
	enoentWriteType,
	enoentWriteValue,
	enoentWriteTypeAndValue
])