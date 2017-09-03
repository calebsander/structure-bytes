"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonTypes = new Set([String, Number, Boolean, Date]);
function toObject(obj) {
    const result = {};
    for (const key in obj) {
        /*istanbul ignore else*/
        if ({}.hasOwnProperty.call(obj, key))
            result[key] = obj[key];
    }
    return result;
}
/**
 * A simple replacement for `util.inspect()`.
 * Makes little effort at readability,
 * and cannot handle circular values.
 * Useful for generating more detailed
 * error messages, and so that the client-side
 * code doesn't need to pack `util` as a dependency.
 * @param obj The value to inspect
 * @return A string expressing the given value
 */
function inspect(obj) {
    if (obj === undefined)
        return 'undefined';
    if (obj === null || jsonTypes.has(obj.constructor))
        return JSON.stringify(obj);
    if (obj instanceof ArrayBuffer) {
        const castBuffer = new Uint8Array(obj);
        let result = '[';
        for (const b of castBuffer) {
            if (result !== '[')
                result += ', ';
            result += '0x' + (b < 16 ? '0' : '') + b.toString(16);
        }
        return result + ']';
    }
    //tslint:disable-next-line:strict-type-predicates
    if (typeof Buffer !== 'undefined' && obj instanceof Buffer) {
        let result = '<Buffer';
        for (const b of obj)
            result += ' ' + (b < 16 ? '0' : '') + b.toString(16);
        return result + '>';
    }
    if (obj instanceof Set) {
        let result = 'Set {';
        const iterator = obj.values();
        let value = iterator.next();
        while (!value.done) {
            result += inspect(value.value);
            value = iterator.next();
            if (!value.done)
                result += ', ';
        }
        return result + '}';
    }
    if (obj instanceof Map) {
        let result = 'Map {';
        const iterator = obj.entries();
        let value = iterator.next();
        while (!value.done) {
            result += inspect(value.value[0]);
            result += ' => ';
            result += inspect(value.value[1]);
            value = iterator.next();
            if (!value.done)
                result += ', ';
        }
        return result + '}';
    }
    if (obj instanceof Array) {
        let result = '[';
        const iterator = obj[Symbol.iterator]();
        let value = iterator.next();
        while (!value.done) {
            result += inspect(value.value);
            value = iterator.next();
            if (!value.done)
                result += ', ';
        }
        return result + ']';
    }
    if (obj instanceof Function) {
        return 'Function ' + obj.name;
    }
    if (obj.constructor === Object) {
        let result = '{';
        for (const key in obj) {
            /*istanbul ignore else*/
            if ({}.hasOwnProperty.call(obj, key)) {
                if (result !== '{')
                    result += ', ';
                result += key + ': ' + inspect(obj[key]);
            }
        }
        return result + '}';
    }
    const { name } = obj.constructor;
    return (name ? name + ' ' : '') + inspect(toObject(obj));
}
exports.inspect = inspect;
