"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts strings to their number representation,
 * or `undefined` if they are invalid.
 * Generally converts by using `Number()`
 * and rejects `NaN` values, except `''` is
 * considered invalid and `'NaN'` is considered valid.
 * @param str The string to convert
 */
exports.default = (str) => {
    if (str) { //avoid errors with undefined.constructor and null.constructor; also '' is invalid
        //eslint-disable-next-line @typescript-eslint/ban-types
        if (str.constructor === String) {
            const converted = Number(str);
            if (!isNaN(converted) || str === 'NaN')
                return converted;
        }
    }
    return; //returned if conversion failed
};
