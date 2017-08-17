declare const _default: ((condition: boolean, message?: string | undefined) => void) & {
    instanceOf: (instance: any, constructors: Function | Function[]) => void;
    integer: (instance: any) => void;
    between: (lower: number, value: number, upper: number, message?: string | undefined) => void;
    byteUnsignedInteger: (value: any) => void;
    fail: (message: string) => never;
    throws: (block: () => void, message?: string | undefined) => void;
    equal: (actual: any, expected: any) => void;
    errorMessage: (err: Error | null, message: string) => void;
};
export default _default;
