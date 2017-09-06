import AppendableBuffer from '../lib/appendable';
import AbsoluteType from './absolute';
import Type from './type';
/**
 * A type storing a value of one of several fixed types.
 * The list of possible types must contain at most 255 types.
 *
 * Example:
 * ````javascript
 * let hexType = new sb.StructType({
 *   hex: new sb.StringType
 * })
 * let rgbType = new sb.StructType({
 *   r: new sb.FloatType,
 *   g: new sb.FloatType,
 *   b: new sb.FloatType
 * })
 * let hueType = new sb.FloatType
 * let type = new sb.ChoiceType([
 *   hexType,
 *   rgbType,
 *   hueType
 * ])
 * ````
 *
 * @param E The type of value this choice type can write.
 * If you provide, e.g. a `Type<A>` and a `Type<B>` and a `Type<C>`
 * to the constructor, `E` should be `A | B | C`.
 * In TypeScript, you have to declare this manually
 * unless all the value types are identical.
 */
export default class ChoiceType<E> extends AbsoluteType<E> {
    static readonly _value: number;
    /**
     * The array of types passed into the constructor
     */
    readonly types: Type<E>[];
    /**
     * @param types The list of possible types.
     * Cannot contain more than 255 types.
     * Values will be written using the first type in the list
     * that successfully writes the value,
     * so place higher priority types earlier.
     */
    constructor(types: Type<E>[]);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, {hex: '#abcdef'}) //writes using hexType
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, {r: 1, g: 0, b: 0.5}) //writes using rgbType
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, 180) //writes using hueType
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E): void;
    equals(otherType: any): boolean;
}
