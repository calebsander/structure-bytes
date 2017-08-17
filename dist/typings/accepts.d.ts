/// <reference types="node" />
declare module 'accepts' {
    interface ParamsInterface {
        encoding(encodings: string[]): boolean;
    }
    const accepts: (req: IncomingMessage) => ParamsInterface;
    export = accepts;
}
