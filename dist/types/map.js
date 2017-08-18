"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const growable_buffer_1 = require("../lib/growable-buffer");
const pointers_1 = require("../lib/pointers");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
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
class MapType extends absolute_1.default {
    /**
     * @param {Type} keyType The type of each key in the map
     * @param {Type} valueType The type of each value in the map
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
    writeValue(buffer, value, root = true) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        assert_1.default.instanceOf(value, Map);
        buffer.addAll(flexInt.makeValueBuffer(value.size));
        for (const [mapKey, mapValue] of value) {
            this.keyType.writeValue(buffer, mapKey, false);
            this.valueType.writeValue(buffer, mapValue, false);
        }
        pointers_1.setPointers({ buffer, root });
    }
    equals(otherType) {
        return super.equals(otherType)
            && this.keyType.equals(otherType.keyType)
            && this.valueType.equals(otherType.valueType);
    }
}
exports.default = MapType;
