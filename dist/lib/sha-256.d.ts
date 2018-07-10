export declare function sha256JS(input: ArrayBuffer): ArrayBuffer;
export declare const sha256WASM: typeof sha256JS | undefined;
declare const _default: typeof sha256JS;
/**
 * Computes a SHA-256 hash of the binary data,
 * output as an `ArrayBuffer`.
 * Implementation details mostly copied from
 * [Wikipedia](https://en.wikipedia.org/wiki/SHA-2#Pseudocode).
 * @param input The input data
 */
export default _default;
