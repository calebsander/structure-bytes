import GrowableBuffer from './lib/growable-buffer';
import { RegisterableType } from './recursive-registry-type';
/**
 * The superclass of each class representing a possible type.
 * This class should only be used to check if an object is a valid type.
 */
export interface Type<VALUE> {
    /**
     * Appends the type information to a {@link GrowableBuffer}.
     * All types start with the byte specified by {@link Type._value}.
     * For the most primitive types, this implementation is sufficient.
     * More complex types should override this method,
     * invoking [super.addToBuffer()]{@link Type#addToBuffer} and then adding their own data if it returns true.
     * @param {GrowableBuffer} buffer The buffer to append to
     * @return {boolean} {@link false} if it wrote a pointer to a previous instance, {@link true} if it wrote the type byte. Intended to only be used internally.
     */
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Gets the type in buffer form, using a cached value if present.
     * Since types are immutable, the result should never change from the cached value.
     * @return {external:ArrayBuffer} A Buffer containing the type bytes
     */
    toBuffer(): ArrayBuffer;
    /**
     * Gets an SHA256 hash of the type, using a cached value if present
     * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
     */
    getHash(): string;
    /**
     * Gets a signature string for the type, using a cached value if present.
     * This string encodes the specification version and the type hash.
     * @return {string} a signature for the type
     */
    getSignature(): string;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If called on the {@link Type} class
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: VALUE, root?: boolean): void;
    /**
     * Gets a {@link Buffer} containing the value in binary format.
     * See this type's {@link writeValue()} documentation
     * for acceptable values.
     * @param {*} value The value to write
     * @return {external:ArrayBuffer} a {@link Buffer} storing the value (assuming the type is known)
     * @see Type#writeValue
     */
    valueBuffer(value: VALUE): ArrayBuffer;
    /**
     * Returns whether this type object represents the same type as another object
     * @param {Type} otherType Another object to compare with
     * @return {boolean} {@link true} iff the types have the same constructor and the same field values for fields that don't store cached results
     */
    equals(otherType: any): boolean;
}
export declare abstract class AbstractType<VALUE> implements Type<VALUE> {
    private cachedBuffer?;
    private cachedHash?;
    private cachedSignature?;
    private cachedTypeLocations?;
    /**
     * Returns an unsigned byte value unique to this type class;
     * used to serialize the type
     */
    static readonly _value: number;
    addToBuffer(buffer: GrowableBuffer): boolean;
    toBuffer(): ArrayBuffer;
    /**
     * Generates the type buffer, recomputed each time
     * @private
     * @see Type#toBuffer
     * @return {external:ArrayBuffer} A Buffer containing the type bytes
     */
    private _toBuffer();
    getHash(): string;
    /**
     * Gets an SHA256 hash of the type, recomputed each time
     * @private
     * @see Type#getHash
     * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
     */
    private _getHash();
    getSignature(): string;
    /**
     * Gets a signature string for the type, recomputed each time
     * @private
     * @see Type#getSignature
     * @return {string} a signature for the type
     */
    private _getSignature();
    abstract writeValue(buffer: GrowableBuffer, value: VALUE, root?: boolean): void;
    valueBuffer(value: VALUE): ArrayBuffer;
    equals(otherType: any): boolean;
}
/**
 * A type that is not a {@link PointerType}.
 * Used internally to disallow creating double pointers.
 * @private
*/
export declare abstract class AbsoluteType<VALUE> extends AbstractType<VALUE> {
}
/**
 * A type storing an signed integer
 * @private
 */
export declare abstract class IntegerType<VALUE> extends AbsoluteType<VALUE> {
}
/**
 * A type storing a 1-byte signed integer
 * @extends Type
 * @inheritdoc
 */
export declare class ByteType extends IntegerType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing a 2-byte signed integer
 * @extends Type
 * @inheritdoc
 */
export declare class ShortType extends IntegerType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing a 4-byte signed integer
 * @extends Type
 * @inheritdoc
 */
export declare class IntType extends IntegerType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing an 8-byte signed integer
 * @extends Type
 * @inheritdoc
 */
export declare class LongType extends IntegerType<string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (a base-10 string representation of an integer)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: string): void;
}
/**
 * A type storing an arbitrary precision signed integer.
 * Each written value has its own number of bytes of precision.
 * @extends Type
 * @inheritdoc
 */
export declare class BigIntType extends IntegerType<string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (a base-10 string representation of an integer)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: string): void;
}
/**
 * A type storing an unsigned integer
 * @private
 */
export declare abstract class UnsignedType<VALUE> extends AbsoluteType<VALUE> {
}
/**
 * A type storing a 1-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
export declare class UnsignedByteType extends UnsignedType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing a 2-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
export declare class UnsignedShortType extends UnsignedType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing a 4-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
export declare class UnsignedIntType extends UnsignedType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing an 8-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
export declare class UnsignedLongType extends UnsignedType<string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (a base-10 string representation of an integer)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: string): void;
}
/**
 * A type storing an arbitrary precision unsigned integer.
 * Each written value has its own number of bytes of precision.
 * @extends Type
 * @inheritdoc
 */
export declare class BigUnsignedIntType extends UnsignedType<string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (a base-10 string representation of an integer)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: string): void;
}
/**
 * A type storing any unsigned integer
 * that can be represented precisely in a double
 * (from 0 to 9007199254740991 (2^53 - 1)).
 * Rather than having a fixed-length value representation,
 * more bytes are needed to represent larger values.
 * This is inspired by the UTF-8 format:
 * large values can be stored, but since most values
 * are small, fewer bytes are used in the typical case.<br>
 * <br>
 * The number of bytes required for numbers are as follows:
 * <table>
 *   <thead><tr><th>Number range</th><th>Bytes</th></tr></thead>
 *   <tbody>
 *     <tr><td>0 to 127</td><td>1</td></tr>
 *     <tr><td>128 to 16511</td><td>2</td></tr>
 *     <tr><td>16512 to 2113663</td><td>3</td></tr>
 *     <tr><td>2113664 to 270549119</td><td>4</td></tr>
 *     <tr><td>270549120 to 34630287487</td><td>5</td></tr>
 *     <tr><td>34630287488 to 4432676798591</td><td>6</td></tr>
 *     <tr><td>4432676798592 to 567382630219903</td><td>7</td></tr>
 *     <tr><td>567382630219904 to 9007199254740991</td><td>8</td></tr>
 *   </tbody>
 * </table>
 * @extends Type
 * @inheritdoc
 */
export declare class FlexUnsignedIntType extends UnsignedType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write (between 0 and 9007199254740991)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing some sort of time.
 * @private
 */
export declare abstract class ChronoType extends AbsoluteType<Date> {
}
/**
 * A type storing a [Date]{@link external:Date} with millisecond precision.
 * The value is stored as an 8-byte signed integer.
 * @extends Type
 * @inheritdoc
 */
export declare class DateType extends ChronoType {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {external:Date} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: Date): void;
}
/**
 * A type storing a specific day in history.
 * The value is stored as a 3-byte signed integer.
 * @extends Type
 * @inheritdoc
 */
export declare class DayType extends ChronoType {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {external:Date} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: Date): void;
}
/**
 * A type storing a specific time of day.
 * The value is stored as a 4-byte unsigned integer.
 * @extends Type
 * @inheritdoc
 */
export declare class TimeType extends ChronoType {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {external:Date} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: Date): void;
}
/**
 * A type storing a [floating-point number]{@linkplain https://en.wikipedia.org/wiki/Floating_point}
 * @private
 */
export declare abstract class FloatingPointType extends AbsoluteType<number | string> {
}
/**
 * A type storing a 4-byte [IEEE floating point]{@linkplain https://en.wikipedia.org/wiki/IEEE_floating_point}
 * @extends Type
 * @inheritdoc
 */
export declare class FloatType extends FloatingPointType {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing an 8-byte [IEEE floating point]{@linkplain https://en.wikipedia.org/wiki/IEEE_floating_point}
 * @extends Type
 * @inheritdoc
 */
export declare class DoubleType extends FloatingPointType {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {number|string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
/**
 * A type storing a {@link Boolean} value (a bit)
 * @extends Type
 * @inheritdoc
 */
export declare class BooleanType extends AbsoluteType<boolean> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {boolean} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: boolean): void;
}
/**
 * A type storing a fixed-length array of {@link Boolean} values.
 * This type creates more efficient serializations than
 * {@link TupleType} for boolean arrays.
 * The length must be at most 255.
 * @see BooleanType
 * @see TupleType
 * @extends Type
 * @inheritdoc
 */
export declare class BooleanTupleType extends AbsoluteType<boolean[]> {
    static readonly _value: number;
    readonly length: number;
    /**
     * @param {number} length The number of {@link Boolean}s in each value of this type.
     * Must fit in a 1-byte unsigned integer.
     */
    constructor(length: number);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Boolean[]} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: boolean[]): void;
    equals(otherType: any): boolean;
}
/**
 * A type storing a variable-length array of {@link Boolean} values.
 * This type creates more efficient serializations than
 * {@link ArrayType} for boolean arrays.
 * @see BooleanType
 * @extends Type
 * @inheritdoc
 */
export declare class BooleanArrayType extends AbsoluteType<boolean[]> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Boolean[]} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: boolean[]): void;
}
/**
 * A type storing a single UTF-8 character
 * @extends Type
 * @inheritdoc
 */
export declare class CharType extends AbsoluteType<string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (must be only 1 character long)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: string): void;
}
/**
 * A type storing a string of UTF-8 characters, with no bound on length
 * @extends Type
 * @inheritdoc
 */
export declare class StringType extends AbsoluteType<string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: string): void;
}
/**
 * A type storing an array of bytes.
 * This is intended for data, e.g. a hash, that doesn't fit any other category.
 * @extends Type
 * @inheritdoc
 */
export declare class OctetsType extends AbsoluteType<ArrayBuffer> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {external:ArrayBuffer} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: ArrayBuffer): void;
}
export interface TupleParams<E> {
    type: Type<E>;
    length: number;
}
/**
 * A type storing a fixed-length array of values of the same type.
 * The length must be at most 255.
 * @example
 * //For storing 5 4-byte unsigned integers
 * let type = new sb.TupleType({type: new sb.UnsignedIntType, length: 5})
 * @extends Type
 * @inheritdoc
 */
export declare class TupleType<E> extends AbsoluteType<E[]> {
    static readonly _value: number;
    readonly type: Type<E>;
    readonly length: number;
    /**
     * @param {{type, length}} params
     * @param {Type} params.type The type of each element in the tuple
     * @param {number} params.length The number of elements in the tuple.
     * Must fit in a 1-byte unsigned integer.
     */
    constructor({type, length}: TupleParams<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {type[]} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, [10, 5, 101, 43, 889])
     */
    writeValue(buffer: GrowableBuffer, value: E[], root?: boolean): void;
    equals(otherType: any): boolean;
}
export interface StringIndexable {
    [key: string]: any;
}
export interface StructField<E> {
    name: string;
    type: Type<E>;
    nameBuffer: ArrayBuffer;
}
export declare type StructFields<E> = {
    [key in keyof E]: Type<E[key]>;
};
/**
 * A type storing up to 255 named fields
 * @example
 * //For storing a person's information
 * let type = new sb.StructType({
 *   name: new sb.StringType,
 *   age: new sb.UnsignedByteType,
 *   drowsiness: new sb.DoubleType
 * })
 * @extends Type
 * @inheritdoc
 */
export declare class StructType<E extends StringIndexable> extends AbsoluteType<E> {
    static readonly _value: number;
    readonly fields: StructField<any>[];
    /**
     * @param {Object.<string, Type>} fields A mapping of field names to their types.
     * There can be no more than 255 fields.
     * Each field name must be at most 255 bytes long in UTF-8.
     */
    constructor(fields: StructFields<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Object} value The value to write. Each field must have a valid value supplied.
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, {
     *   name: 'Papa',
     *   age: 67,
     *   drowsiness: 0.2
     * })
     */
    writeValue(buffer: GrowableBuffer, value: E, root?: boolean): void;
    equals(otherType: any): boolean;
}
/**
 * A type storing a variable-length array of values of the same type
 * @example
 * //For storing some number of people in order
 * let personType = new sb.StructType({...})
 * let type = new sb.ArrayType(personType)
 * @extends Type
 * @inheritdoc
 */
export declare class ArrayType<E> extends AbsoluteType<E[]> {
    static readonly _value: number;
    readonly type: Type<E>;
    /**
     * @param {Type} type The type of each element in the array
     */
    constructor(type: Type<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {type[]} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, [person1, person2, person3])
     */
    writeValue(buffer: GrowableBuffer, value: E[], root?: boolean): void;
    equals(otherType: any): boolean;
}
/**
 * A type storing a variable-size set of values of the same type
 * Works much like {@link ArrayType} except all values are {@link Set}s.
 * @example
 * //For storing some number of people
 * let personType = new sb.StructType({...})
 * let type = new sb.SetType(personType)
 * @extends ArrayType
 * @inheritdoc
 */
export declare class SetType<E> extends AbsoluteType<Set<E>> {
    static readonly _value: number;
    readonly type: Type<E>;
    /**
     * @param {Type} type The type of each element in the set
     */
    constructor(type: Type<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Set.<type>} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, new Set().add(person1).add(person2).add(person3))
     */
    writeValue(buffer: GrowableBuffer, value: Set<E>, root?: boolean): void;
    equals(otherType: any): boolean;
}
/**
 * A type storing a variable-size mapping of keys of one type to values of another
 * @example
 * //For storing friendships (a mapping of people to their set of friends)
 * let personType = new sb.StructType({...})
 * let type = new sb.MapType(
 *   personType,
 *   new sb.SetType(personType)
 * )
 * @extends Type
 * @inheritdoc
 */
export declare class MapType<K, V> extends AbsoluteType<Map<K, V>> {
    static readonly _value: number;
    readonly keyType: Type<K>;
    readonly valueType: Type<V>;
    /**
     * @param {Type} keyType The type of each key in the map
     * @param {Type} valueType The type of each value in the map
     */
    constructor(keyType: Type<K>, valueType: Type<V>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Map.<keyType, valueType>} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * let friendMap = new Map
     * friendMap.set(person1, new Set([person2, person3]))
     * friendMap.set(person2, new Set([person1]))
     * friendMap.set(person3, new Set([person1]))
     * type.writeValue(buffer, friendMap)
     */
    writeValue(buffer: GrowableBuffer, value: Map<K, V>, root?: boolean): void;
    equals(otherType: any): boolean;
}
export interface EnumParams<E> {
    type: Type<E>;
    values: E[];
}
/**
 * A type storing a value in a fixed set of possible values.
 * There can be at most 255 possible values.
 * @example
 * //Storing different species' characteristics
 * const HUMAN = {heightFt: 6, speedMph: 28}
 * const CHEETAH = {heightFt: 3, speedMph: 70}
 * let type = new sb.EnumType({
 *   type: new sb.StructType({
 *     heightFt: new sb.FloatType,
 *     speedMph: new sb.UnsignedByteType
 *   }),
 *   values: [HUMAN, CHEETAH]
 * })
 * @extends Type
 * @inheritdoc
 */
export declare class EnumType<E> extends AbstractType<E> {
    static readonly _value: number;
    private readonly type;
    readonly values: E[];
    private readonly valueIndices;
    /**
     * @param {{type, value}} params
     * @param {Type} params.type The type of each element in the tuple
     * @param {type[]} params.values The possible distinct values.
     * Cannot contain more than 255 values.
     * @throws {Error} If any value is invalid for {@link type}
     */
    constructor({type, values}: EnumParams<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {type} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, CHEETAH)
     */
    writeValue(buffer: GrowableBuffer, value: E, root?: boolean): void;
    equals(otherType: any): boolean;
}
/**
 * A type storing a value of one of several fixed types.
 * The list of possible types must contain at most 255 types.
 * @example
 * //If you have a lot of numbers that fit in an unsigned byte
 * //but could conceivably have one that requires a long
 * let type = new sb.ChoiceType([
 *   new sb.UnsignedByteType,
 *   new sb.UnsignedLongType
 * ])
 * @extends Type
 * @inheritdoc
 */
export declare class ChoiceType<E> extends AbsoluteType<E> {
    static readonly _value: number;
    readonly types: Type<E>[];
    /**
     * @param {Type[]} types The list of possible types.
     * Cannot contain more than 255 types.
     * Values will be written using the first type in the list
     * that successfully writes the value,
     * so place higher priority types earlier.
     */
    constructor(types: Type<E>[]);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, 10) //writes as an unsigned byte
     * type.writeValue(buffer, 1000) //writes as an unsigned long
     */
    writeValue(buffer: GrowableBuffer, value: E, root?: boolean): void;
    equals(otherType: any): boolean;
}
export interface NameAndType<E> {
    nameBuffer: ArrayBuffer;
    type: StructType<E>;
}
/**
 * A type storing a value of one of several fixed classes.
 * Each class is associated with a {@link StructType}
 * used to write values of instances of the class.
 * Unlike {@link ChoiceType}, read values specify the type
 * used to write them.
 * The list of possible types must contain at most 255 types.
 * {@link NamedChoiceType} is similar to {@link ChoiceType} in most respects.
 * @example
 * //Storing various barcode types
 * class QRCode {
 *   constructor(text) {
 *     this.text = text
 *   }
 * }
 * class UPC {
 *   constructor(number) {
 *     this.number = number
 *   }
 * }
 * let barcodeType = new sb.NamedChoiceType(new Map()
 *   .set(QRCode, new sb.StructType({
 *     text: new sb.StringType
 *   }))
 *   .set(UPC, new sb.StructType({
 *     number: new sb.UnsignedLongType
 *   }))
 * )
 * @extends Type
 * @inheritdoc
 */
export declare class NamedChoiceType<E extends object> extends AbsoluteType<E> {
    static readonly _value: number;
    readonly constructorTypes: NameAndType<E>[];
    readonly indexConstructors: Map<number, Function>;
    /**
     * @param {Map.<constructor, StructType>} types The mapping
     * of constructors to associated types.
     * Cannot contain more than 255 types.
     * Values will be written using the type
     * associated with the first constructor in the map
     * of which they are an instance,
     * so place higher priority types earlier.
     * For example, if you wanted to be able to write
     * the values of instances of a subclass and a superclass,
     * put the subclass first so that all its fields
     * are written, not just those inherited from the superclass.
     */
    constructor(constructorTypes: Map<Function, StructType<E>>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type.
     * The constructor name will be transfered to the read value.
     * So, if you write using the type associated with {@link QRCode},
     * the read value's constructor will also be named {@link "QRCode"}.
     * If, however, you write an instance of a subclass of {@link QRCode},
     * it will write as {@link QRCode} and the read value's constructor
     * will be named {@link "QRCode"}.
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, new QRCode('abc')) //writes as QRCode
     * type.writeValue(buffer, new UPC('0123')) //writes as UPC
     */
    writeValue(buffer: GrowableBuffer, value: E, root?: boolean): void;
    equals(otherType: any): boolean;
}
/**
 * A type that can refer recursively to itself.
 * This is not a type in its own right, but allows you
 * to have some other type use itself in its definition.
 * Values that contain circular references will have the
 * references preserved after serialization and deserialization.
 * @example
 * //A binary tree of unsigned bytes
 * const treeType = new sb.RecursiveType('tree-node')
 * sb.registerType({
 *   type: new sb.StructType({
 *     left: new sb.OptionalType(treeType),
 *     value: new sb.UnsignedByteType,
 *     right: new sb.OptionalType(treeType)
 *   }),
 *   name: 'tree-node' //name must match name passed to RecursiveType constructor
 * })
 * @extends Type
 * @inheritdoc
 */
export declare class RecursiveType<E> extends AbsoluteType<E> {
    static readonly _value: number;
    readonly name: string;
    /**
     * @param {string} name The name of the type,
     * as registered using {@link registerType}
     */
    constructor(name: string);
    readonly type: RegisterableType & Type<E>;
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * treeType.writeValue(buffer, {
     *   left: {
     *     left: {
     *       left: null,
     *       value: 1,
     *       right: null
     *     },
     *     value: 2,
     *     right: {
     *       left: null,
     *       value: 3,
     *       right: null
     *     }
     *   },
     *   value: 4,
     *   right: {
     *     left: null,
     *     value: 5,
     *     right: {
     *       left: null,
     *       value: 6,
     *       right: null
     *     }
     *   }
     * })
     */
    writeValue(buffer: GrowableBuffer, value: E, root?: boolean): void;
    equals(otherType: any): boolean;
}
/**
 * A type storing a value of another type or {@link null} or {@link undefined}.
 * {@link null} and {@link undefined} are treated identically,
 * and reading either value will result in {@link null}.
 * @example
 * //If you have a job slot that may or may not be filled
 * let personType = new sb.StructType({...})
 * let type = new sb.StructType({
 *   title: new sb.StringType,
 *   employee: new sb.OptionalType(personType)
 * })
 * @extends Type
 * @inheritdoc
 */
export declare class OptionalType<E> extends AbsoluteType<E | null | undefined> {
    static readonly _value: number;
    readonly type: Type<E>;
    /**
     * @param {Type} type The type of any non-{@link null} value
     */
    constructor(type: Type<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {null|undefined|type} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, {
     *   title: 'Manager',
     *   employee: person1
     * })
     * type.writeValue(buffer, {
     *   title: 'Assistant Librarian',
     *   employee: null
     * })
     * type.writeValue(buffer, {
     *   title: 'Assistant Librarian'
     * })
     */
    writeValue(buffer: GrowableBuffer, value: E | null | undefined, root?: boolean): void;
    equals(otherType: any): boolean;
}
/**
 * A type storing a value of another type through a pointer.
 * If you expect to have the same large value repeated many times,
 * using a pointer will decrease the size of the value [ArrayBuffer]{@link external:ArrayBuffer}.
 * Each time the value is written, it will use 4 bytes to write the pointer,
 * so you will only save space if the value is longer than 4 bytes and written more than once.
 * @example
 * //If the same people will be used many times
 * let personType = new sb.PointerType(
 *   new sb.StructType({
 *     dob: new sb.DateType,
 *     id: new sb.UnsignedShortType,
 *     name: new sb.StringType
 *   })
 * )
 * let tribeType = new sb.StructType({
 *   leader: personType,
 *   members: new sb.SetType(personType),
 *   money: new sb.MapType(personType, new sb.FloatType)
 * })
 * @extends Type
 * @inheritdoc
 */
export declare class PointerType<E> extends AbstractType<E> {
    static readonly _value: number;
    readonly type: Type<E>;
    /**
     * @param {Type} type The type of any value
     */
    constructor(type: Type<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {type} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * let louis = {
     *   dob: new Date(1437592284193),
     *   id: 9,
     *   name: 'Louis'
     * },
     * garfield = {
     *   dob: new Date(1437592284194),
     *   id: 17,
     *   name: 'Garfield'
     * }
     * let value = {
     *   leader: {
     *     dob: new Date(1437592284192),
     *     id: 10,
     *     name: 'Joe'
     *   },
     *   members: new Set().add(louis).add(garfield),
     *   money: new Map().set(louis, 23.05).set(garfield, -10.07)
     * }
     * tribeType.writeValue(buffer, value)
     */
    writeValue(buffer: GrowableBuffer, value: E, root?: boolean): void;
    equals(otherType: any): boolean;
}
