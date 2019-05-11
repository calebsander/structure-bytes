"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonTypes = new Set([String, Number, Boolean, Date]);
/**
 * Converts a byte to a 2-digit hexadecimal string
 * @param n The byte value
 * @return `n` with a possible leading 0
 */
exports.hexByte = (n) => (n < 16 ? '0' : '') + n.toString(16);
/**
 * A simple replacement for `util.inspect()`.
 * Makes little effort at readability.
 * Useful for generating more detailed
 * error messages, and so that the client-side
 * code doesn't need to pack `util` as a dependency.
 * @param obj The value to inspect
 * @return A string expressing the given value
 */
exports.inspect = (obj) => inspectWithSeen(obj, new Set);
function inspectWithSeen(obj, seen) {
    if (obj === undefined)
        return 'undefined';
    if (obj === null || jsonTypes.has(obj.constructor))
        return JSON.stringify(obj);
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
    const { name } = obj.constructor;
    let objectResult = `${name && name !== 'Object' ? name + ' ' : ''}{`;
    for (const key in obj) {
        /*istanbul ignore else*/
        if ({}.hasOwnProperty.call(obj, key)) {
            if (firstElement)
                firstElement = false;
            else
                objectResult += ', ';
            objectResult += key + ': ' + inspectWithSeen(obj[key], seen);
        }
    }
    seen.delete(obj);
    return objectResult + '}';
}
