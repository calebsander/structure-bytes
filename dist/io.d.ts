/// <reference types="node" />
import * as http from 'http';
import { Readable, Writable } from 'stream';
import Type from './types/type';
export interface WriteParams<E> {
    type: Type<E>;
    outStream: Writable;
}
export interface WriteTypeValueParams<E> extends WriteParams<E> {
    value: E;
}
export interface ReadValueParams<E> {
    type: Type<E>;
    inStream: Readable;
}
export interface HttpParams<E> {
    req: http.IncomingMessage;
    res: http.OutgoingMessage;
    type: Type<E>;
    value: E;
}
/**
 * A callback that receives only a possible error
 */
export declare type ErrCallback = (err: Error | null) => void;
/**
 * A callback that receives a possible error and,
 * if no error occurred, a read type
 */
export declare type TypeCallback<E> = (err: Error | null, type: Type<E> | null) => void;
/**
 * A callback that receives a possible error and,
 * if no error occurred, a read value
 */
export declare type ValueCallback<E> = (err: Error | null, value: E | null) => void;
/**
 * A callback that receives a possible error and,
 * if no error occurred, a read type and value
 */
export declare type TypeAndValueCallback<E> = (err: Error | null, type: Type<E> | null, value: E | null) => void;
/**
 * Writes the contents of `type.toBuffer()` ([[Type.toBuffer]])
 * followed by a null byte to a writable stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
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
 * ````
 *
 * @param type The type to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
export declare function writeType({type, outStream}: WriteParams<any>, callback?: ErrCallback): Writable;
/**
 * Writes the contents of `type.valueBuffer(value)` ([[Type.valueBuffer]])
 * followed by a null byte to a writable stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * sb.writeValue({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbv')
 * }, err => {
 *   if (err) throw err
 *   console.log('Done')
 * })
 * ````
 *
 * @param E The type of value being written
 * @param type The type to use to write the value
 * @param value The value to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
export declare function writeValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback): Writable;
/**
 * Writes the contents of `type.toBuffer()` ([[Type.toBuffer]]),
 * followed by the contents of `type.valueBuffer(value)` ([[Type.valueBuffer]]),
 * and then a null byte to a writable stream.
 * Calls `callback` when done.
 *
 * Example:
 * ````javascript
 * sb.writeTypeAndValue({
 *   type: new sb.FlexUnsignedIntType,
 *   value: 1000,
 *   outStream: fs.createWriteStream('out.sbtv')
 * }, err => {
 *   if (err) throw err
 *   console.log('Done')
 * })
 * ````
 *
 * @param E The type of value being written
 * @param type The type to write and to use to write the value
 * @param value The value to write
 * @param outStream The stream to write to
 * @param callback The optional callback to call when write ends
 * @return `outStream`
 */
export declare function writeTypeAndValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback): Writable;
/**
 * Reads a type from a readable stream.
 * This should be used when reading from sources
 * written to by [[writeType]].
 * Calls `callback` with the type when done.
 *
 * Example:
 * ````javascript
 * sb.readType(fs.createReadStream('out.sbt'), (err, type) => {
 *   if (err) throw err
 *   console.log(type)
 * })
 * ````
 *
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
export declare function readType(inStream: Readable, callback: TypeCallback<any>): void;
/**
 * Reads a value from a readable stream.
 * The [[Type]] used to write the value bytes must be known.
 * This should be used when reading from sources
 * written to by [[writeValue]].
 * Calls `callback` with the value when done.
 *
 * Example:
 * ````javascript
 * sb.readValue({
 *   type: new sb.FlexUnsignedIntType,
 *   inStream: fs.createReadStream('out.sbv')
 * }, (err, value) => {
 *   if (err) throw err
 *   console.log(value)
 * })
 * ````
 *
 * @param E The type of value being read
 * (must match the `VALUE` parameter of `type`)
 * @param type The [[Type]] (or an equivalent one) that wrote the value bytes
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
export declare function readValue<E>({type, inStream}: ReadValueParams<E>, callback: ValueCallback<E>): void;
/**
 * Reads a type and a value from a readable stream.
 * This should be used when reading from sources
 * written to by [[writeTypeAndValue]].
 * Calls `callback` with the type and value when done.
 *
 * Example:
 * ````javascript
 * sb.readTypeAndValue(fs.createReadStream('out.sbtv'), (err, type, value) => {
 *   if (err) throw err
 *   console.log(type, value)
 * })
 * ````
 *
 * @param inStream The stream to read from
 * @param callback The callback to call with the read result
 */
export declare function readTypeAndValue(inStream: Readable, callback: TypeAndValueCallback<any>): void;
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
export declare function httpRespond<E>({req, res, type, value}: HttpParams<E>, callback?: ErrCallback): void;
