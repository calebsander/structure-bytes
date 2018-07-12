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
    return inspectWithSeen(obj, new Map);
}
exports.inspect = inspect;
function inspectWithSeen(obj, seen) {
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
    if (obj instanceof Function) {
        return 'Function ' + obj.name;
    }
    //obj might have circular references
    if (seen.get(obj))
        return '[Circular]';
    else
        seen.set(obj, 1);
    if (obj instanceof Set) {
        let result = 'Set {';
        const iterator = obj.values();
        let value = iterator.next();
        while (!value.done) {
            result += inspectWithSeen(value.value, seen);
            value = iterator.next();
            if (!value.done)
                result += ', ';
        }
        seen.set(obj, seen.get(obj) - 1);
        return result + '}';
    }
    if (obj instanceof Map) {
        let result = 'Map {';
        const iterator = obj.entries();
        let value = iterator.next();
        while (!value.done) {
            result += inspectWithSeen(value.value[0], seen);
            result += ' => ';
            result += inspectWithSeen(value.value[1], seen);
            value = iterator.next();
            if (!value.done)
                result += ', ';
        }
        seen.set(obj, seen.get(obj) - 1);
        return result + '}';
    }
    if (obj instanceof Array) {
        let result = '[';
        const iterator = obj[Symbol.iterator]();
        let value = iterator.next();
        while (!value.done) {
            result += inspectWithSeen(value.value, seen);
            value = iterator.next();
            if (!value.done)
                result += ', ';
        }
        seen.set(obj, seen.get(obj) - 1);
        return result + ']';
    }
    if (obj.constructor === Object) { //as opposed to a subclass of Object
        let result = '{';
        for (const key in obj) {
            /*istanbul ignore else*/
            if ({}.hasOwnProperty.call(obj, key)) {
                if (result !== '{')
                    result += ', ';
                result += key + ': ' + inspectWithSeen(obj[key], seen);
            }
        }
        seen.set(obj, seen.get(obj) - 1);
        return result + '}';
    }
    const { name } = obj.constructor;
    const genericResult = (name ? name + ' ' : '') + inspectWithSeen(toObject(obj), seen);
    seen.set(obj, seen.get(obj) - 1);
    return genericResult;
}
