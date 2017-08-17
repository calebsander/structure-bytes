declare module 'js-sha256' {
    interface Hash {
        update(bytes: ArrayBuffer | string): void;
        arrayBuffer(): ArrayBuffer;
        hex(): string;
    }
    interface HashFunction {
        create(): Hash;
    }
    const sha256: HashFunction;
}
