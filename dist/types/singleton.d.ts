import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import AbstractType from './abstract';
import type { Type } from './type';
export interface SingletonParams<E> {
    type: Type<E, any>;
    value: E;
}
/**
 * A type storing a fixed value.
 * The value takes up no space in the value bytes,
 * only the type bytes.
 * Functions as an [[EnumType]] with only one value.
 *
 * Example:
 * ````javascript
 * //Encodes a JSON literal value
 * let type = new sb.ChoiceType([
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'boolean'
 *     }),
 *     value: new sb.BooleanType
 *   }),
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'number'
 *     }),
 *     value: new sb.DoubleType
 *   }),
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'string'
 *     }),
 *     value: new sb.StringType
 *   })
 * ])
 * ````
 *
 * @param E The type of the value
 */
export declare class SingletonType<E> extends AbstractType<E> {
    static get _value(): number;
    /** The type used to serialize the value */
    readonly type: Type<E>;
    /** The value that this type serializes */
    readonly value: E;
    private cachedValueBuffer;
    /**
     * @param type The type that can serialize this type's value
     * @param value The value to serialize
     * @throws If `value` cannot be serialized by `type`
     */
    constructor({ type, value }: SingletonParams<E>);
    private get singletonValueBuffer();
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, {type: 'boolean', value: true})
     * type.writeValue(buffer, {type: 'string', value: 'abc'})
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E): void;
    consumeValue(): ReadResult<E>;
    equals(otherType: unknown): boolean;
}
