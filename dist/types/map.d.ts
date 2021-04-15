import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import AbsoluteType from './absolute';
import type { Type } from './type';
/**
 * A type storing a variable-size mapping of keys of one type to values of another
 *
 * Example:
 * ````javascript
 * //For storing stock prices on different days
 * let type = new sb.MapType(
 *   new sb.StringType,
 *   new sb.MapType(
 *     new sb.DayType,
 *     new sb.FloatType
 *   )
 * )
 * ````
 *
 * @param K The type of values stored in keys of the map
 * @param V The type of values stored in values of the map
 * @param READ_K The type of keys this type will read
 * @param READ_V The type of values this type will read
 */
export declare class MapType<K, V, READ_K extends K = K, READ_V extends V = V> extends AbsoluteType<Map<K, V>, Map<READ_K, READ_V>> {
    readonly keyType: Type<K, READ_K>;
    readonly valueType: Type<V, READ_V>;
    static get _value(): number;
    /**
     * @param keyType The type of each key in the map
     * @param valueType The type of each value in the map
     */
    constructor(keyType: Type<K, READ_K>, valueType: Type<V, READ_V>);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * let GOOG = new Map()
     *   .set(new Date(2000, 0, 1), 33.2)
     *   .set(new Date(2000, 0, 2), 38.5)
     *   .set(new Date(2000, 0, 3), 39.9)
     * let YHOO = new Map()
     *   .set(new Date(2010, 0, 1), 10.1)
     *   .set(new Date(2010, 0, 2), 10.2)
     * let AMZN = new Map()
     * let stocks = new Map()
     *   .set('GOOG', GOOG)
     *   .set('YHOO', YHOO)
     *   .set('AMZN', AMZN)
     * type.writeValue(buffer, stocks)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: Map<K, V>): void;
    consumeValue(buffer: ArrayBuffer, offset: number, baseValue?: Map<READ_K, READ_V>): ReadResult<Map<READ_K, READ_V>>;
    equals(otherType: unknown): boolean;
}
