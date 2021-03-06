/**
 * Converts UTF-8 bytes to a JavaScript string.
 * The inverse of [[fromString]].
 * @param buffer The binary data to convert
 */
export declare function toString(buffer: Uint8Array, maxLength?: number): string;
/**
 * Converts a JavaScript string to UTF-8 bytes.
 * The inverse of [[toString]].
 * @param str The string to convert
 */
export declare function fromString(str: string): ArrayBuffer;
/**
 * Converts bytes to a JavaScript string where
 * each character corresponds to one byte.
 * Like [[toString]] but works with bytes
 * that are invalid UTF-8.
 * Mainly used for using `ArrayBuffer`s as keys in maps.
 * @param buffer The binary data to convert
 */
export declare function toBinaryString(buffer: ArrayBuffer): string;
/**
 * Converts a string generated by [[toBinaryString]]
 * back into the bytes that generated it
 * @param str The string to convert
 */
export declare function fromBinaryString(str: string): ArrayBuffer;
