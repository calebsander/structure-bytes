import AppendableBuffer from '../lib/appendable';
import AbsoluteType from './absolute';
import StructType from './struct';
export interface NameAndType<E> {
    nameBuffer: ArrayBuffer;
    type: StructType<E>;
}
/**
 * A type storing a value of one of several fixed classes.
 * Each class is associated with a [[StructType]]
 * used to write values of instances of the class.
 * Unlike [[ChoiceType]], read values specify the type
 * used to write them.
 * Be aware that the constructor of the read value is synthetic,
 * so it will not be the same as the constructor of the written value.
 * However, they will have the same name.
 * [[NamedChoiceType]] is similar to [[ChoiceType]] in other respects.
 * The list of possible types must contain at most 255 types.
 *
 * Example:
 * ````javascript
 * //Storing various barcode types
 * class QRCode {
 *   constructor(text) {
 *     this.text = text
 *   }
 * }
 * class UPC {
 *   constructor(number) {
 *     this.number = number
 *   }
 * }
 * let barcodeType = new sb.NamedChoiceType(new Map()
 *   .set(QRCode, new sb.StructType({
 *     text: new sb.StringType
 *   }))
 *   .set(UPC, new sb.StructType({
 *     number: new sb.UnsignedLongType
 *   }))
 * )
 * ````
 *
 * @param E The type of value this choice type can write.
 * If you provide, e.g. a `Type<A>` and a `Type<B>` and a `Type<C>`
 * to the constructor, `E` should be `A | B | C`.
 * In TypeScript, you have to declare this manually
 * unless all the value types are identical.
 */
export default class NamedChoiceType<E extends object> extends AbsoluteType<E> {
    static readonly _value: number;
    /**
     * The names of constructors and each's matching [[Type]]
     */
    readonly constructorTypes: NameAndType<E>[];
    /**
     * A map of constructor indices to constructors.
     * Essentially an array.
     */
    readonly indexConstructors: Map<number, Function>;
    /**
     * @param constructorTypes The mapping
     * of constructors to associated types.
     * Cannot contain more than 255 types.
     * Values will be written using the type
     * associated with the first constructor in the map
     * of which they are an instance,
     * so place higher priority types earlier.
     * For example, if you wanted to be able to write
     * the values of instances of a subclass and a superclass,
     * put the subclass first so that all its fields
     * are written, not just those inherited from the superclass.
     */
    constructor(constructorTypes: Map<Function, StructType<E>>);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * let buffer = new GrowableBuffer
     * barcodeType.writeValue(buffer, new QRCode('abc'))
     * let readValue = sb.r.value({
     *   type: barcodeType,
     *   buffer: buffer.toBuffer()
     * })
     * console.log(readValue.constructor.name) //'QRCode'
     * ````
     * or
     * ````javascript
     * let buffer = new GrowableBuffer
     * barcodeType.writeValue(buffer, new UPC('0123'))
     * let readValue = sb.r.value({
     *   type: barcodeType,
     *   buffer: buffer.toBuffer()
     * })
     * console.log(readValue.constructor.name) //'UPC'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E): void;
    equals(otherType: any): boolean;
}
