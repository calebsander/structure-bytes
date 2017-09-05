"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const write_iterable_1 = require("../lib/write-iterable");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
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
class ArrayType extends absolute_1.default {
    /**
     * @param type A [[Type]] that can serialize each element in the array
     */
    constructor(type) {
        super();
        assert_1.default.instanceOf(type, abstract_1.default);
        this.type = type;
    }
    static get _value() {
        return 0x52;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.type.addToBuffer(buffer);
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
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
    writeValue(buffer, value) {
        assert_1.default.instanceOf(value, Array);
        write_iterable_1.default({ type: this.type, buffer, value, length: value.length });
    }
    equals(otherType) {
        return super.equals(otherType) && this.type.equals(otherType.type);
    }
}
exports.default = ArrayType;
