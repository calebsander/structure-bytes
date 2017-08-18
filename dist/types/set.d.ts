import GrowableBuffer from '../lib/growable-buffer';
import AbsoluteType from './absolute';
import Type from './type';
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
export default class SetType<E> extends AbsoluteType<Set<E>> {
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
