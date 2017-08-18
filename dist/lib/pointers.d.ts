import GrowableBuffer from './growable-buffer';
export interface AddInstanceParams {
    buffer: GrowableBuffer;
    value: ArrayBuffer;
}
export declare function addInstance({buffer, value}: AddInstanceParams): void;
export interface SetPointersParams {
    buffer: GrowableBuffer;
    root: boolean;
}
export declare function setPointers({buffer, root}: SetPointersParams): void;
