import GrowableBuffer from '../lib/growable-buffer';
import AbsoluteType from './absolute';
import StructType from './struct';
export interface NameAndType<E> {
    nameBuffer: ArrayBuffer;
    type: StructType<E>;
}
/**
 * A type storing a value of one of several fixed classes.
 * Each class is associated with a {@link StructType}
 * used to write values of instances of the class.
 * Unlike {@link ChoiceType}, read values specify the type
 * used to write them.
 * The list of possible types must contain at most 255 types.
 * {@link NamedChoiceType} is similar to {@link ChoiceType} in most respects.
 * @example
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
 * @extends Type
 * @inheritdoc
 */
export default class NamedChoiceType<E extends object> extends AbsoluteType<E> {
    static readonly _value: number;
    readonly constructorTypes: NameAndType<E>[];
    readonly indexConstructors: Map<number, Function>;
    /**
     * @param {Map.<constructor, StructType>} types The mapping
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
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type.
     * The constructor name will be transfered to the read value.
     * So, if you write using the type associated with {@link QRCode},
     * the read value's constructor will also be named {@link "QRCode"}.
     * If, however, you write an instance of a subclass of {@link QRCode},
     * it will write as {@link QRCode} and the read value's constructor
     * will be named {@link "QRCode"}.
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * type.writeValue(buffer, new QRCode('abc')) //writes as QRCode
     * type.writeValue(buffer, new UPC('0123')) //writes as UPC
     */
    writeValue(buffer: GrowableBuffer, value: E, root?: boolean): void;
    equals(otherType: any): boolean;
}
