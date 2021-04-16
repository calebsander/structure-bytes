/**
 * Represents the input by its unique `flexInt` format
 * @param value A non-negative JavaScript integer value
 * @return An `ArrayBuffer` containing 1 to 8 bytes
 */
export declare function makeValueBuffer(value: number): ArrayBuffer;
/**
 * Gets the number of bytes taken up by a `flexInt`,
 * given its first byte, so the slice of the buffer containing
 * the `flexInt` can be extracted
 * @param firstByte The first byte of the `flexInt`
 * @return The length of the `flexInt`
 */
export declare function getByteCount(firstByte: number): number;
/**
 * Converts a binary `flexInt` representation
 * into the number it stores.
 * The inverse of [[makeValueBuffer]].
 * @param valueBuffer The binary `flexInt` representation
 * @return The number used to generate the `flexInt` buffer
 */
export declare function readValueBuffer(valueBuffer: Uint8Array): number;
