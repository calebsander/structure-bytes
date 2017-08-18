import GrowableBuffer from '../lib/growable-buffer';
import AbsoluteType from './absolute';
import Type from './type';
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
export default class MapType<K, V> extends AbsoluteType<Map<K, V>> {
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
