"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
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
class MapType extends absolute_1.default {
    /**
     * @param keyType The type of each key in the map
     * @param valueType The type of each value in the map
     */
    constructor(keyType, valueType) {
        super();
        assert_1.default.instanceOf(keyType, abstract_1.default);
        assert_1.default.instanceOf(valueType, abstract_1.default);
        this.keyType = keyType;
        this.valueType = valueType;
    }
    static get _value() {
        return 0x54;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.keyType.addToBuffer(buffer);
            this.valueType.addToBuffer(buffer);
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
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
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        assert_1.default.instanceOf(value, Map);
        buffer.addAll(flexInt.makeValueBuffer(value.size));
        for (const [mapKey, mapValue] of value) { //for each key-value pairing, write key and value
            this.keyType.writeValue(buffer, mapKey);
            this.valueType.writeValue(buffer, mapValue);
        }
    }
    consumeValue(buffer, offset, baseValue) {
        const size = read_util_1.readFlexInt(buffer, offset);
        let { length } = size;
        const value = baseValue || read_util_1.makeBaseValue(this);
        for (let i = 0; i < size.value; i++) {
            const keyElement = this.keyType.consumeValue(buffer, offset + length);
            length += keyElement.length;
            const valueElement = this.valueType.consumeValue(buffer, offset + length);
            length += valueElement.length;
            value.set(keyElement.value, valueElement.value);
        }
        return { value, length };
    }
    equals(otherType) {
        return super.equals(otherType)
            && this.keyType.equals(otherType.keyType)
            && this.valueType.equals(otherType.valueType);
    }
}
exports.default = MapType;
