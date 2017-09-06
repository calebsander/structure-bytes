import AppendableBuffer from '../lib/appendable';
import AbsoluteType from './absolute';
import Type from './type';
/**
 * A type storing a variable-length array of values of the same type
 *
 * Example:
 * ````javascript
 * class Car {
 *   constructor(brand, model, year) {
 *     this.brand = brand
 *     this.model = model
 *     this.year = year
 *   }
 * }
 * let carType = new sb.StructType({ //Type<Car>
 *   brand: new sb.StringType,
 *   model: new sb.StringType,
 *   year: new sb.ShortType
 * })
 * let type = new sb.ArrayType(carType) //Type<Car[]>
 * ````
 *
 * @param E The type of each element in the array
 */
export default class ArrayType<E> extends AbsoluteType<E[]> {
    static readonly _value: number;
    /**
     * The [[Type]] passed into the constructor
     */
    readonly type: Type<E>;
    /**
     * @param type A [[Type]] that can serialize each element in the array
     */
    constructor(type: Type<E>);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * let car1 = new Car('VW', 'Bug', 1960)
     * let car2 = new Car('Honda', 'Fit', 2015)
     * let car3 = new Car('Tesla', 'Model 3', 2017)
     * type.writeValue(buffer, [car1, car2, car3])
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E[]): void;
    equals(otherType: any): boolean;
}
