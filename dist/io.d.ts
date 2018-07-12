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
    type: Type<any, E>;
    inStream: Readable;
}
export interface TypeAndValue<E> {
    type: Type<E>;
    value: E;
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
export declare function writeType({type, outStream}: WriteParams<any>, callback?: ErrCallback): Writable;
export declare namespace writeType {
    function __promisify__(params: WriteParams<any>): Promise<void>;
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
export declare function writeValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback): Writable;
export declare namespace writeValue {
    function __promisify__<E>(params: WriteTypeValueParams<E>): Promise<void>;
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
export declare function writeTypeAndValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback): Writable;
export declare namespace writeTypeAndValue {
    function __promisify__<E>(params: WriteTypeValueParams<E>): Promise<void>;
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
export declare function readType<E>(inStream: Readable, callback: TypeCallback<E>): void;
export declare namespace readType {
    function __promisify__<E>(inStream: Readable): Promise<Type<E>>;
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
export declare function readValue<E>({type, inStream}: ReadValueParams<E>, callback: ValueCallback<E>): void;
export declare namespace readValue {
    function __promisify__<E>(params: ReadValueParams<E>): Promise<E>;
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
export declare function readTypeAndValue<E>(inStream: Readable, callback: TypeAndValueCallback<E>): void;
export declare namespace readTypeAndValue {
    function __promisify__<E>(inStream: Readable): Promise<TypeAndValue<E>>;
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
export declare function httpRespond<E>({req, res, type, value}: HttpParams<E>, callback?: ErrCallback): void;
export declare namespace httpRespond {
    function __promisify__<E>(params: HttpParams<E>): Promise<void>;
}
