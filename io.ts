//This file contains functions for performing I/O;
//specifically, reads and writes of types and values and HTTP responses

import * as http from 'http'
import {Duplex, Readable, Writable} from 'stream'
import * as zlib from 'zlib'
import accepts = require('accepts')
import assert from './lib/assert'
import BufferStream from './lib/buffer-stream'
import GrowableBuffer from './lib/growable-buffer'
import * as r from './read'
import AbstractType from './types/abstract'
import Type from './types/type'

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}
const WRITABLE_STREAMS = [Writable, Duplex, http.OutgoingMessage]

export interface WriteParams<E> {
	type: Type<E>
	outStream: Writable
}
export interface WriteTypeValueParams<E> extends WriteParams<E> {
	value: E
}
export interface ReadValueParams<E> {
	type: Type<E>
	inStream: Readable
}
export interface HttpParams<E> {
	req: http.IncomingMessage
	res: http.OutgoingMessage
	type: Type<E>
	value: E
}
export type ErrCallback = (err: Error | null) => void
export type TypeCallback<E> = (err: Error | null, type: Type<E> | null) => void
export type ValueCallback<E> = (err: Error | null, value: E | null) => void
export type TypeAndValueCallback<E> = (err: Error | null, type: Type<E> | null, value: E | null) => void

/**
 * A callback that receives an error object, if any was thrown.
 * @callback errCallback
 * @param {null|Error} err The error (if any) that occurred
 */
/** @function
 * @name writeType
 * @desc Writes type bytes to a writable stream.
 * Writes the contents of [type.toBuffer()]{@link Type#toBuffer}
 * followed by a null byte.
 * Calls {@link callback} when done.
 * @param {{type, outStream}} params
 * @param {Type} params.type The type to write
 * @param {stream.Writable} params.outStream The stream to write to
 * @param {errCallback=} callback
 * @return {stream.Writable} {@link params.outStream}
 */
export function writeType<E>({type, outStream}: WriteParams<E>, callback?: ErrCallback) {
	assert.instanceOf(type, AbstractType)
	assert.instanceOf(outStream, WRITABLE_STREAMS)
	if (callback === undefined) callback = () => {}
	assert.instanceOf(callback, Function)
	let typeBuffer: ArrayBuffer
	try { typeBuffer = type.toBuffer() }
	catch (err) {
		callback(err)
		return outStream
	}
	const typeStream = new BufferStream(typeBuffer)
	return typeStream.pipe(outStream)
		.on('error', function(this: typeof outStream, err: Error) {
			this.end()
			callback!(err)
		})
		.on('finish', () => callback!(null))
}

/** @function
 * @name writeValue
 * @desc Writes value bytes to a writable stream.
 * Writes the contents of [type.valueBuffer(value)]{@link Type#valueBuffer}
 * followed by a null byte.
 * Calls {@link callback} when done.
 * @param {{type, value, outStream}} params
 * @param {Type} params.type The type to use to write the value
 * @param {type} params.value The value to write
 * @param {stream.Writable} params.outStream The stream to write to
 * @param {errCallback=} callback
 * @return {stream.Writable} {@link params.outStream}
 */
export function writeValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback) {
	assert.instanceOf(type, AbstractType)
	assert.instanceOf(outStream, WRITABLE_STREAMS)
	if (callback === undefined) callback = () => {}
	assert.instanceOf(callback, Function)
	const valueBuffer = new GrowableBuffer
	try { type.writeValue(valueBuffer, value) }
	catch (err) {
		callback(err)
		return outStream
	}
	return new BufferStream(valueBuffer).pipe(outStream)
		.on('error', function(this: typeof outStream, err: Error) {
			this.end()
			callback!(err)
		})
		.on('finish', () => callback!(null))
	}

/** @function
 * @name writeTypeAndValue
 * @desc Writes both type and value bytes to a writable stream.
 * Writes the contents of [type.toBuffer()]{@link Type#toBuffer},
 * followed by the contents of [type.valueBuffer(value)]{@link Type#valueBuffer},
 * and then a null byte.
 * Calls {@link callback} when done.
 * @param {{type, value, outStream}} params
 * @param {Type} params.type The type to write
 * and to use to write the value
 * @param {type} params.value The value to write
 * @param {stream.Writable} params.outStream The stream to write to
 * @param {errCallback=} callback
 * @return {stream.Writable} {@link params.outStream}
 */
export function writeTypeAndValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback) {
	assert.instanceOf(type, AbstractType)
	assert.instanceOf(outStream, WRITABLE_STREAMS)
	if (callback === undefined) callback = () => {}
	assert.instanceOf(callback, Function)
	let typeBuffer: ArrayBuffer
	try { typeBuffer = type.toBuffer() }
	catch (err) {
		callback(err)
		return outStream
	}
	const typeStream = new BufferStream(typeBuffer)
	typeStream.pipe(outStream, {end: false})
		.on('error', function(this: typeof outStream) {
			this.end()
		})
	typeStream.on('bs-written', () => { //can't listen for finish because it is called on a pipe without an end
		writeValue({type, value, outStream}, callback)
	})
	return outStream
}

/**
 * A callback that receives an error object, if any was thrown,
 * and a type, if no error was thrown.
 * @callback typeCallback
 * @param {null|Error} err The error (if any) that occurred
 * @param {null|Type} type The type that was read
 */
/** @function
 * @name readType
 * @desc Reads a type from a readable stream.
 * This should be used when reading from sources
 * written to by {@link writeType}.
 * Calls {@link callback} with the type when done.
 * @param {stream.Readable} inStream The stream to read from
 * @param {typeCallback} callback
 */
export function readType(inStream: Readable, callback: TypeCallback<any>) {
	assert.instanceOf(inStream, Readable)
	assert.instanceOf(callback, Function)
	const segments: Buffer[] = []
	inStream
		.on('data', chunk => segments.push(chunk as Buffer))
		.on('error', function(this: typeof inStream, err: Error) {
			this.destroy()
			callback(err, null)
		})
		.on('end', () => {
			const buffer = Buffer.concat(segments)
			let type: Type<any>
			try { type = r.type(toArrayBuffer(buffer), false) }
			catch (e) { return callback(e, null) }
			callback(null, type) //if error occurred, don't callback with a null type
		})
}

/**
 * A callback that receives an error object, if any was thrown,
 * and a value, if no error was thrown.
 * @callback valueCallback
 * @param {null|Error} err The error (if any) that occurred
 * @param {null|type} value The value that was read
 */
/** @function
 * @name readValue
 * @desc Reads a value from a readable stream.
 * The {@link Type} used to write the value bytes must be known.
 * This should be used when reading from sources
 * written to by {@link writeValue}.
 * Calls {@link callback} with the value when done.
 * @param {{type, inStream}} params
 * @param {Type} params.type The type that wrote the value bytes
 * @param {stream.Readable} params.inStream The stream to read from
 * @param {valueCallback} callback
 */
export function readValue<E>({type, inStream}: ReadValueParams<E>, callback: ValueCallback<E>) {
	assert.instanceOf(inStream, Readable)
	assert.instanceOf(callback, Function)
	const segments: Buffer[] = []
	inStream
		.on('data', chunk => segments.push(chunk as Buffer))
		.on('error', function(this: typeof inStream, err: Error) {
			this.destroy()
			callback(err, null)
		})
		.on('end', () => {
			const buffer = Buffer.concat(segments)
			let value: E
			try { value = r.value({buffer: toArrayBuffer(buffer), type}) }
			catch (e) { return callback(e, null) }
			callback(null, value) //if error occurred, don't callback with a null value
		})
	}

/**
 * A callback that receives an error object, if any was thrown,
 * and a type and value, if no error was thrown.
 * @callback typeAndValueCallback
 * @param {null|Error} err The error (if any) that occurred
 * @param {null|Type} type The type that was read
 * @param {null|type} value The value that was read
 */
/** @function
 * @name readTypeAndValue
 * @desc Reads a type and a value from a readable stream.
 * This should be used when reading from sources
 * written to by {@link writeTypeAndValue}.
 * Calls {@link callback} with the type and value when done.
 * @param {stream.Readable} inStream The stream to read from
 * @param {typeAndValueCallback} callback
 */
export function readTypeAndValue(inStream: Readable, callback: TypeAndValueCallback<any>) {
	assert.instanceOf(inStream, Readable)
	assert.instanceOf(callback, Function)
	const segments: Buffer[] = []
	inStream
		.on('data', chunk => segments.push(chunk as Buffer))
		.on('error', function(this: typeof inStream, err: Error) {
			this.destroy()
			callback(err, null, null)
		})
		.on('end', () => {
			const buffer = Buffer.concat(segments)
			let type: {value: Type<any>, length: number}
			//Using consumeType() in order to get the length of the type (the start of the value)
			try { type = r._consumeType(toArrayBuffer(buffer), 0) }
			catch (e) { return callback(e, null, null) }
			let value: any
			try { value = r.value({buffer: toArrayBuffer(buffer), offset: type.length, type: type.value}) }
			catch (e) { return callback(e, null, null) }
			callback(null, type.value, value) //if error occurred, don't callback with null value or type
		})
}

/** @function
 * @name httpRespond
 * @desc Responds to an HTTP(S) request for a value.
 * Will send both type and value if the {@link sig} header
 * doesn't match the type's signature.
 * Will only send the value if the signatures match.
 * Response is gzipped to decrease size.
 * Calls {@link callback} when done.
 * @param {{req, res, type, value}} params
 * @param {external:http.IncomingMessage} params.req The client request
 * @param {external:http.OutgoingMessage} params.res The server response
 * @param {Type} params.type The type of the message
 * @param {type} params.value The value to send
 * @param {errCallback=} callback
 */
export function httpRespond<E>({req, res, type, value}: HttpParams<E>, callback?: ErrCallback) {
	assert.instanceOf(type, AbstractType)
	if (callback === undefined) callback = () => {}
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
		function writeEndCallback(err: Error) {
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