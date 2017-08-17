/// <reference types="node" />
import * as http from 'http';
import { Readable, Writable } from 'stream';
import { Type } from './structure-types';
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
export declare type ErrCallback = (err: Error | null) => void;
export declare type TypeCallback<E> = (err: Error | null, type: Type<E> | null) => void;
export declare type ValueCallback<E> = (err: Error | null, value: E | null) => void;
export declare type TypeAndValueCallback<E> = (err: Error | null, type: Type<E> | null, value: E | null) => void;
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
export declare function writeType<E>({type, outStream}: WriteParams<E>, callback?: ErrCallback): Writable;
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
export declare function writeValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback): Writable;
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
export declare function writeTypeAndValue<E>({type, value, outStream}: WriteTypeValueParams<E>, callback?: ErrCallback): Writable;
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
export declare function readType(inStream: Readable, callback: TypeCallback<any>): void;
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
export declare function readValue<E>({type, inStream}: ReadValueParams<E>, callback: ValueCallback<E>): void;
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
export declare function readTypeAndValue(inStream: Readable, callback: TypeAndValueCallback<any>): void;
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
export declare function httpRespond<E>({req, res, type, value}: HttpParams<E>, callback?: ErrCallback): void;
