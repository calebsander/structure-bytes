import type { RegisterableType } from '../recursive-registry-type';
export declare const NOT_LONG_ENOUGH = "Buffer is not long enough";
/**
 * The result of reading a value from bytes
 * @param E The type of value read
 */
export interface ReadResult<E> {
    /**
     * The value read
     */
    value: E;
    /**
     * The number of bytes used to store the value
     */
    length: number;
}
/**
 * Creates a value that can be mutated into a read value
 * for the given [[Type]].
 * This allows a reference to the read value to be used
 * before the read value is populated.
 * @param readType The [[Type]] reading a value
 * @param count If an [[ArrayType]], must pass in a length
 * to initialize the array value with
 * @return `[]`, `new Map`, `new Set`, or `{}`
 */
export declare function makeBaseValue(readType: RegisterableType, count?: number): unknown;
/**
 * Reads a byte from the buffer,
 * requires it to be `0x00` or `0xFF`,
 * and returns its boolean value
 * @param buffer The buffer to read from
 * @param offset The position in `buffer`
 * of the byte to read
 * @return `true` if the byte is `0xFF`,
 * `false` if it is `0x00`
 */
export declare function readBooleanByte(buffer: ArrayBuffer, offset: number): ReadResult<boolean>;
export interface ReadBooleansParams {
    buffer: ArrayBuffer;
    offset: number;
    count: number;
}
/**
 * Inverse of `writeBooleans()`, i.e. reads
 * a given number of booleans from binary data
 * @param buffer The bytes to read from
 * @param offset The position in `buffer`
 * of the first byte containing the booleans
 * @param count The number of boolean values to read
 * @return The array of booleans read
 */
export declare function readBooleans({ buffer, offset, count }: ReadBooleansParams): ReadResult<boolean[]>;
/**
 * Reads an unsigned integer in `flexInt` format
 * @param buffer The binary data to read from
 * @param offset The position of the first byte
 * of the `flexInt`
 * @return The number stored in the `flexInt`
 */
export declare function readFlexInt(buffer: ArrayBuffer, offset: number): ReadResult<number>;
/**
 * Reads a signed long
 * @param buffer The binary data to read from
 * @param offset The position of the first byte to read
 * @return The value stored in the `8` bytes
 * starting at `offset`, in string form
 */
export declare function readLong(buffer: ArrayBuffer, offset: number): ReadResult<bigint>;
/**
 * A `TypedArray` constructor, e.g. `Uint8Array`
 */
export declare type TypedArray = typeof Int8Array | typeof Int16Array | typeof Int32Array | typeof Uint8Array | typeof Uint16Array | typeof Uint32Array | typeof Float32Array | typeof Float64Array;
/**
 * The name of a `get*` method of `DataView`.
 * Method has the signature `(offset: number) => number`,
 * ignoring endianness.
 */
export declare type GetNumberFunction = 'getInt8' | 'getInt16' | 'getInt32' | 'getUint8' | 'getUint16' | 'getUint32' | 'getFloat32' | 'getFloat64';
/**
 * A `TypedArray` type and the name of the
 * corresponding `DataView` `get*` method
 */
export interface TypeAndFunc {
    func: GetNumberFunction;
    type: TypedArray;
}
/**
 * Creates an [[AbstractType.consumeValue]] method
 * for a type corresponding to an element of a `TypedArray`.
 * @param func The `DataView.get*` method,
 * e.g. `'getUint8'`
 * @param type The corresponding `TypedArray` constructor,
 * e.g. `Uint8Array`
 * @return A function that takes in an `ArrayBuffer`
 * and an offset in the buffer and reads a `number`,
 * much like [[AbstractType.consumeValue]]
 */
export declare function readNumber({ func, type }: TypeAndFunc): (buffer: ArrayBuffer, offset: number) => ReadResult<number>;
