"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspect = exports.hexByte = void 0;
//eslint-disable-next-line @typescript-eslint/ban-types
const JSON_TYPES = new Set([String, Number, Boolean, Date]);
/**
 * Converts a byte to a 2-digit hexadecimal string
 * @param n The byte value
 * @return `n` with a possible leading 0
 */
const hexByte = (n) => (n < 16 ? '0' : '') + n.toString(16);
exports.hexByte = hexByte;
/**
 * A simple replacement for `util.inspect()`.
 * Makes little effort at readability.
 * Useful for generating more detailed
 * error messages, and so that the client-side
 * code doesn't need to pack `util` as a dependency.
 * @param obj The value to inspect
 * @return A string expressing the given value
 */
const inspect = (obj) => inspectWithSeen(obj, new Set);
exports.inspect = inspect;
function inspectWithSeen(obj, seen) {
    if (obj === undefined || obj == null)
        return `${obj}`;
    //eslint-disable-next-line @typescript-eslint/ban-types
    const { constructor } = obj;
    if (obj === null || JSON_TYPES.has(constructor))
        return JSON.stringify(obj);
    if (constructor === BigInt)
        return `${obj}n`;
    if (obj instanceof ArrayBuffer || obj instanceof Uint8Array) {
        return `<${obj.constructor.name} ${[...new Uint8Array(obj)].map(exports.hexByte).join(' ')}>`;
    }
    if (obj instanceof Function) {
        return 'Function ' + obj.name;
    }
    //obj might have circular references
    if (seen.has(obj))
        return '[Circular]';
    seen.add(obj);
    let firstElement = true;
    if (obj instanceof Set) {
        let result = 'Set {';
        for (const value of obj) {
            if (firstElement)
                firstElement = false;
            else
                result += ', ';
            result += inspectWithSeen(value, seen);
        }
        seen.delete(obj);
        return result + '}';
    }
    if (obj instanceof Map) {
        let result = 'Map {';
        for (const [key, value] of obj) {
            if (firstElement)
                firstElement = false;
            else
                result += ', ';
            result += inspectWithSeen(key, seen) + ' => ' + inspectWithSeen(value, seen);
        }
        seen.delete(obj);
        return result + '}';
    }
    if (obj instanceof Array) {
        const result = `[${obj.map(item => inspectWithSeen(item, seen)).join(', ')}]`;
        seen.delete(obj);
        return result;
    }
    const { name } = constructor;
    let objectResult = `${name && name !== 'Object' ? name + ' ' : ''}{`;
    const objRecord = obj;
    for (const key in objRecord) {
        /*istanbul ignore else*/
        if ({}.hasOwnProperty.call(obj, key)) {
            if (firstElement)
                firstElement = false;
            else
                objectResult += ', ';
            objectResult += key + ': ' + inspectWithSeen(objRecord[key], seen);
        }
    }
    seen.delete(obj);
    return objectResult + '}';
}
