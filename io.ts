//This file contains functions for performing I/O;
//specifically, reads and writes of types and values and HTTP responses

import * as http from 'http'
import {Readable, Writable} from 'stream'
import {promisify} from 'util'
import * as zlib from 'zlib'
import * as accepts from 'accepts'
import AppendableStream from './lib/appendable-stream'
import * as assert from './lib/assert'
import {ReadResult} from './lib/read-util'
import * as r from './read'
import AbstractType from './types/abstract'
import {Type} from './types'

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
	const {buffer: arrayBuffer, byteOffset, byteLength} = buffer
	return !byteOffset && byteLength === arrayBuffer.byteLength
		? arrayBuffer // if Buffer occupies whole ArrayBuffer, no need to slice it
		: arrayBuffer.slice(byteOffset, byteOffset + byteLength)
}
type ArrayBufferCallback = (err: Error | null, buffer: ArrayBuffer | null) => void
function concatStream(stream: Readable, callback: ArrayBufferCallback) {
	const segments: Buffer[] = []
	stream
		.on('data', chunk =>
			segments.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk))
		)
		.on('error', function(this: typeof stream, err) {
			this.destroy()
			callback(err, null)
		})
		.on('end', () =>
			callback(null, toArrayBuffer(Buffer.concat(segments)))
		)
}

export interface WriteParams<E> {
	type: Type<E>
	outStream: Writable
}
export interface WriteTypeValueParams<E> extends WriteParams<E> {
	value: E
}
export interface ReadValueParams<E> {
	type: Type<any, E>
	inStream: Readable
}
export interface TypeAndValue<E> {
	type: Type<E>
	value: E
}
export interface HttpParams<E> {
	req: http.IncomingMessage
	res: http.OutgoingMessage
	type: Type<E>
	value: E
}
/**
 * A callback that receives only a possible error
 */
export type ErrCallback = (err: Error | null) => void
/**
 * A callback that receives a possible error and,
 * if no error occurred, a read type
 */
export type TypeCallback<E> = (err: Error | null, type: Type<E> | null) => void
/**
 * A callback that receives a possible error and,
 * if no error occurred, a read value
 */
export type ValueCallback<E> = (err: Error | null, value: E | null) => void
/**
 * A callback that receives a possible error and,
 * if no error occurred, a read type and value
 */
export type TypeAndValueCallback<E> = (err: Error | null, type: Type<E> | null, value: E | null) => void

/**
 * Writes the contents of `type.toBuffer()` ([[Type.toBuffer]])
 * to a writable stream and then closes the stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.writeType({
 *   type: new sb.StructType({
 *     abc: new sb.ArrayType(new sb.StringType),
 *     def: new sb.DateType
 *   }),
 *   outStream: fs.createWriteStream('out.sbt')
 * }, err => {
 *   if (err) throw err
 *   console.log('Done')
 * })
 *
 * //As a Promise:
 * util.promisify(sb.writeType)({
 *   type: new sb.StructType({
 *     abc: new sb.ArrayType(new sb.StringType),
 *     def: new sb.DateType
 *   }),
 *   outStream: fs.createWriteStream('out.sbt')
 * })
 *   .then(_ => console.log('Done'))
 * ````
 *
 * @param type The type to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
export function writeType({type, outStream}: WriteParams<any>, callback?: ErrCallback): Writable {
	assert.instanceOf(type, AbstractType)
	if (callback === undefined) callback = _ => {}
	assert.instanceOf(callback, Function)
	let error: Error | null = null
	outStream
		.on('error', callback)
		.on('finish', () => callback!(error))
	const typeStream = new AppendableStream(outStream)
	try { type.addToBuffer(typeStream) }
	catch (err) { error = err }
	outStream.end()
	return outStream
}
export declare namespace writeType {
	function __promisify__(params: WriteParams<any>): Promise<void>
}

/**
 * Writes the contents of `type.valueBuffer(value)` ([[Type.valueBuffer]])
 * to a writable stream and then closes the stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.writeValue({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbv')
 * }, err => {
 *   if (err) throw err
 *   console.log('Done')
 * })
 *
 * //As a Promise:
 * util.promisify(sb.writeValue)({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbv')
 * })
 *   .then(_ => console.log('Done'))
 * ````
 *
 * @param E The type of value being written
 * @param type The type to use to write the value
 * @param value The value to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
export function writeValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback): Writable {
	assert.instanceOf(type, AbstractType)
	if (callback === undefined) callback = _ => {}
	assert.instanceOf(callback, Function)
	let error: Error | null = null
	outStream
		.on('error', callback)
		.on('finish', () => callback!(error))
	const valueStream = new AppendableStream(outStream)
	try { type.writeValue(valueStream, value) }
	catch (err) { error = err }
	outStream.end()
	return outStream
}
export declare namespace writeValue {
	function __promisify__<E>(params: WriteTypeValueParams<E>): Promise<void>
}

/**
 * Writes the contents of `type.toBuffer()` ([[Type.toBuffer]]),
 * followed by the contents of `type.valueBuffer(value)` ([[Type.valueBuffer]]),
 * to a writable stream and then closes the stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.writeTypeAndValue({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbtv')
 * }, err => {
 *   if (err) throw err
 *   console.log('Done')
 * })
 *
 * //As a Promise:
 * util.promisify(sb.writeTypeAndValue)({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbtv')
 * })
 *   .then(_ => console.log('Done'))
 * ````
 *
 * @param E The type of value being written
 * @param type The type to write and to use to write the value
 * @param value The value to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
export function writeTypeAndValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback): Writable {
	assert.instanceOf(type, AbstractType)
	if (callback === undefined) callback = _ => {}
	assert.instanceOf(callback, Function)
	let error: Error | null = null
	outStream
		.on('error', callback)
		.on('finish', () => callback!(error))
	const typeValueStream = new AppendableStream(outStream)
	try {
		type.addToBuffer(typeValueStream)
		type.writeValue(typeValueStream, value)
	}
	catch (err) { error = err }
	outStream.end()
	return outStream
}
export declare namespace writeTypeAndValue {
	function __promisify__<E>(params: WriteTypeValueParams<E>): Promise<void>
}

/**
 * Reads a type from a readable stream.
 * This should be used when reading from sources
 * written to by [[writeType]].
 * Calls `callback` with the type when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.readType(fs.createReadStream('out.sbt'), (err, type) => {
 *   if (err) throw err
 *   console.log(type)
 * })
 *
 * //As a Promise:
 * util.promisify(sb.readType)(fs.createReadStream('out.sbt'))
 *   .then(type => console.log(type))
 * ````
 *
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
export function readType<E>(inStream: Readable, callback: TypeCallback<E>) {
	assert.instanceOf(inStream, Readable)
	assert.instanceOf(callback, Function)
	concatStream(inStream, (err, buffer) => {
		if (err) return callback(err, null)

		let type: Type<E>
		try { type = r.type(buffer!, false) }
		catch (e) { return callback(e, null) }
		callback(null, type)
	})
}
export declare namespace readType {
	function __promisify__<E>(inStream: Readable): Promise<Type<E>>
}

/**
 * Reads a value from a readable stream.
 * The [[Type]] used to write the value bytes must be known.
 * This should be used when reading from sources
 * written to by [[writeValue]].
 * Calls `callback` with the value when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.readValue({
 *   type: new sb.FlexUnsignedIntType,
 *   inStream: fs.createReadStream('out.sbv')
 * }, (err, value) => {
 *   if (err) throw err
 *   console.log(value)
 * })
 *
 * //As a Promise:
 * util.promisify(sb.readValue)({
 *   type: new sb.FlexUnsignedIntType,
 *   inStream: fs.createReadStream('out.sbv')
 * })
 *   .then(value => console.log(value))
 * ````
 *
 * @param E The type of value being read
 * (must match the `VALUE` parameter of `type`)
 * @param type The [[Type]] (or an equivalent one) that wrote the value bytes
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
export function readValue<E>({type, inStream}: ReadValueParams<E>, callback: ValueCallback<E>) {
	assert.instanceOf(inStream, Readable)
	assert.instanceOf(callback, Function)
	concatStream(inStream, (err, buffer) => {
		if (err) return callback(err, null)

		let value: E
		try { value = type.readValue(buffer!) }
		catch (e) { return callback(e, null) }
		callback(null, value)
	})
}
export declare namespace readValue {
	function __promisify__<E>(params: ReadValueParams<E>): Promise<E>
}

/**
 * Reads a type and a value from a readable stream.
 * This should be used when reading from sources
 * written to by [[writeTypeAndValue]].
 * Calls `callback` with the type and value when done.
 *
 * Example:
 * ````javascript
 * //With a callback:
 * sb.readTypeAndValue(fs.createReadStream('out.sbtv'), (err, type, value) => {
 *   if (err) throw err
 *   console.log(type, value)
 * })
 *
 * //As a Promise:
 * util.promisify(sb.readTypeAndValue)(fs.createReadStream('out.sbtv'))
 *   .then(({type, value}) => console.log(type, value))
 * ````
 *
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
export function readTypeAndValue<E>(inStream: Readable, callback: TypeAndValueCallback<E>) {
	assert.instanceOf(inStream, Readable)
	assert.instanceOf(callback, Function)
	concatStream(inStream, (err, buffer) => {
		if (err) return callback(err, null, null)

		let type: ReadResult<Type<E>>
		//Using consumeType() in order to get the length of the type (the start of the value)
		try { type = r._consumeType(buffer!, 0) }
		catch (e) { return callback(e, null, null) }
		let value: E
		try { value = type.value.readValue(buffer!, type.length) }
		catch (e) { return callback(e, null, null) }
		callback(null, type.value, value)
	})
}
//Custom promisifiy function because Promise cannot resolve to 2 values
(readTypeAndValue as any)[promisify.custom] = <E>(inStream: Readable) =>
new Promise<TypeAndValue<E>>((resolve, reject) =>
	readTypeAndValue<E>(inStream, (err, type, value) => {
		if (err) reject(err)
		else resolve({type: type!, value: value!})
	})
)
export declare namespace readTypeAndValue {
	function __promisify__<E>(inStream: Readable): Promise<TypeAndValue<E>>
}

/**
 * Responds to an HTTP(S) request for a value.
 * Will send both type and value if the `sig` header
 * doesn't match the type's signature.
 * Will only send the value if the signatures match.
 * Response is gzipped to decrease size, if client allows.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * sb.httpRespond({
 *   req,
 *   res,
 *   type: new sb.DateType
 *   value: new Date
 * })
 * ````
 *
 * @param req The client request
 * @param res The server response
 * @param type The [[Type]] to use to write the value
 * @param value The value to send
 * @param callback The optional callback to call when response ends
 */
export function httpRespond<E>({req, res, type, value}: HttpParams<E>, callback?: ErrCallback) {
	assert.instanceOf(type, AbstractType)
	if (callback === undefined) callback = _ => {}
	assert.instanceOf(callback, Function)
	assert.instanceOf(req, http.IncomingMessage)
	assert.instanceOf(res, http.OutgoingMessage)
	try {
		res.setHeader('Content-Type', 'application/octet-stream')
		res.setHeader('sig', type.getSignature())
		const acceptsGzip = accepts(req).encoding(['gzip'])
		let outStream: Writable
		if (acceptsGzip) {
			res.setHeader('Content-Encoding', 'gzip')
			outStream = zlib.createGzip() //pipe into a zip stream to decrease size of response
		}
		else outStream = res
		function writeEndCallback(err: Error | null) {
			if (err) callback!(err)
			else if (!acceptsGzip) callback!(null)
		}
		if (req.headers.sig && req.headers.sig === type.getSignature()) { //if client already has type, only value needs to be sent
			writeValue({type, value, outStream}, writeEndCallback)
		}
		else writeTypeAndValue({type, value, outStream}, writeEndCallback) //otherwise, type and value need to be sent
		if (acceptsGzip) { //don't pipe until writing begins
			outStream.pipe(res)
				.on('finish', () => callback!(null))
		}
	}
	catch (err) { callback(err) }
}
export declare namespace httpRespond {
	function __promisify__<E>(params: HttpParams<E>): Promise<void>
}