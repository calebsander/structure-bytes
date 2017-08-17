import * as fs from 'fs'
import assert from '../../dist/lib/assert'
import BufferStream from '../../dist/lib/buffer-stream'
import * as io from '../../dist'
import * as t from '../../dist'
import {bufferFrom, concat} from '../test-common'

const invalidTypeBuffer = new Promise((resolve, reject) => {
	io.readTypeAndValue(new BufferStream(bufferFrom([t.ArrayType._value])), (err, type, value) => {
		try {
			assert.errorMessage(err, 'Buffer is not long enough')
			assert.equal(type, null)
			assert.equal(value, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const tooLongTypeBuffer = new Promise((resolve, reject) => {
	const type = new t.ArrayType(new t.UnsignedShortType)
	const typeValueBuffer = concat([
		type.toBuffer(),
		bufferFrom([1])
	])
	io.readTypeAndValue(new BufferStream(typeValueBuffer), (err, type, value) => {
		try {
			assert.errorMessage(err, 'Buffer is not long enough')
			assert.equal(type, null)
			assert.equal(value, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const enoentType = new Promise((resolve, reject) => {
	const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
	io.readType(errorStream, (err, type) => {
		try {
			assert.errorMessage(err, 'ENOENT')
			assert.equal(type, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const enoentValue = new Promise((resolve, reject) => {
	const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
	io.readValue({type: new t.ByteType, inStream: errorStream}, (err, type) => {
		try {
			assert.errorMessage(err, 'ENOENT')
			assert.equal(type, null)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const enoentTypeAndValue = new Promise((resolve, reject) => {
	const errorStream = fs.createReadStream(__dirname + '/asdfasdf')
	io.readTypeAndValue(errorStream, (err, type) => {
		try {
			assert.errorMessage(err, 'ENOENT')
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
const enoentWriteType = new Promise((resolve, reject) => {
	const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
	assert.equal(errorStream.writable, true)
	io.writeType({
		type: intsType,
		outStream: errorStream
	}, err => {
		try {
			assert.errorMessage(err, 'ENOENT')
			assert.equal(errorStream.writable, false)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const intsValue = [null, 10, 30, 20, null, 55]
const enoentWriteValue = new Promise((resolve, reject) => {
	const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
	assert.equal(errorStream.writable, true)
	io.writeValue({
		type: intsType,
		value: intsValue,
		outStream: errorStream
	}, err => {
		try {
			assert.errorMessage(err, 'ENOENT')
			assert.equal(errorStream.writable, false)
			resolve()
		}
		catch (e) { reject(e) }
	})
})
const enoentWriteTypeAndValue = new Promise((resolve, reject) => {
	const errorStream = fs.createWriteStream(__dirname + '/asdf/asdf')
	assert.equal(errorStream.writable, true)
	io.writeTypeAndValue({
		type: intsType,
		value: intsValue,
		outStream: errorStream
	}, err => {
		try {
			assert.errorMessage(err, 'ENOENT')
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