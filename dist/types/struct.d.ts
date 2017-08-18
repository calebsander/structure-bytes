import GrowableBuffer from '../lib/growable-buffer';
import AbsoluteType from './absolute';
import Type from './type';
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
export default class StructType<E extends StringIndexable> extends AbsoluteType<E> {
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
