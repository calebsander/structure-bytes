import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import AbstractType from './abstract';
import { Type } from './type';
export interface EnumParams<E> {
    type: Type<E>;
    values: E[];
}
/**
 * A type storing a value in a fixed set of possible values.
 * There can be at most 255 possible values.
 *
 * Example:
 * ````javascript
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
 * ````
 *
 * @param E The type of each value in the enum
 */
export declare class EnumType<E> extends AbstractType<E> {
    static get _value(): number;
    /** The list of possible values */
    readonly values: E[];
    /** The type used to serialize the values */
    readonly type: Type<E>;
    private cachedValueIndices;
    /**
     * @param type The type of each value of the enum
     * @param values The possible distinct values.
     * @throws If any value cannot be serialized by `type`
     */
    constructor({ type, values }: EnumParams<E>);
    private get valueIndices();
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, CHEETAH)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<E>;
    equals(otherType: unknown): otherType is this;
}
