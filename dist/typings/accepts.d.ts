/// <reference types="node" />
declare module 'accepts' {
    import { IncomingMessage } from 'http';
    interface ParamsInterface {
        encoding(encodings: string[]): boolean;
    }
    const accepts: (req: IncomingMessage) => ParamsInterface;
    export = accepts;
}
