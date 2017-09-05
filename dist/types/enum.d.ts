import GrowableBuffer from '../lib/growable-buffer';
import AbstractType from './abstract';
import Type from './type';
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
export default class EnumType<E> extends AbstractType<E> {
    static readonly _value: number;
    /**
     * The list of possible values
     */
    readonly values: E[];
    private readonly type;
    private readonly valueIndices;
    /**
     * @param type The type of each element in the tuple
     * @param values The possible distinct values.
     * Cannot contain more than 255 values.
     * @throws If any value cannot be serialized by `type`
     */
    constructor({type, values}: EnumParams<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, CHEETAH)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: GrowableBuffer, value: E): void;
    equals(otherType: any): boolean;
}
