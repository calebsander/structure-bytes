declare const _default: (str: any) => number | undefined;
/**
 * Converts strings to their number representation,
 * or `undefined` if they are invalid.
 * Generally converts by using `Number()`
 * and rejects `NaN` values, except `''` is
 * considered invalid and `'NaN'` is considered valid.
 * @param str The string to convert
 */
export default _default;
