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
export default class EnumType<E> extends AbstractType<E> {
    static readonly _value: number;
    readonly values: E[];
    private readonly type;
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
