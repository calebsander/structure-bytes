import AppendableBuffer from '../lib/appendable';
import AbsoluteType from './absolute';
import Type from './type';
/**
 * An object whose keys are strings,
 * i.e. any object
 */
export interface StringIndexable {
    [key: string]: any;
}
export interface StructField<E> {
    name: string;
    type: Type<E>;
    nameBuffer: ArrayBuffer;
}
/**
 * Maps each key in `E` to a type capable of writing
 * the type of value stored by that key in `E`
 */
export declare type StructFields<E> = {
    [key in keyof E]: Type<E[key]>;
};
/**
 * A type storing up to 255 named fields.
 * Intended to model a generic JavaScript object,
 * whose field names are known in advance.
 * If field names are part of the value rather than the type,
 * use a [[MapType]] instead.
 *
 * The value passed into the constructor should resemble
 * the values to be written.
 * For example, to write `{a: 100, b: 'abc', c: false}`,
 * you could use:
 * ````javascript
 * new sb.StructType({
 *   a: new sb.UnsignedIntType,
 *   b: new sb.StringType,
 *   c: new sb.BooleanType
 * })
 * ````
 *
 * Example:
 * ````javascript
 * //For storing a person's information
 * let type = new sb.StructType({
 *   name: new sb.StringType,
 *   age: new sb.UnsignedByteType,
 *   netWorth: new sb.FloatType
 * })
 * ````
 *
 * @param E The type of object values this type can write
 */
export default class StructType<E extends StringIndexable> extends AbsoluteType<E> {
    static readonly _value: number;
    /**
     * An array of the field names with their corresponding types.
     * Fields are sorted lexicographically by name,
     * so that passing in equivalent `fields` objects
     * to the constructor always gives the same result.
     * Field names' UTF-8 representations are also cached.
     */
    readonly fields: StructField<any>[];
    /**
     * @param fields A mapping of field names to their types.
     * There can be no more than 255 fields.
     * Each field name must be at most 255 bytes long in UTF-8.
     */
    constructor(fields: StructFields<E>);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, {
     *   name: 'Gertrude',
     *   age: 29,
     *   netWorth: 1.2e6
     * })
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E): void;
    equals(otherType: any): boolean;
}
