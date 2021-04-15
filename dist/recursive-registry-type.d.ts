import { ArrayType, MapType, SetType, StructType, TupleType } from './types';
export declare type RegisterableType = ArrayType<unknown> | MapType<unknown, unknown> | SetType<unknown> | StructType<any> | TupleType<unknown>;
export interface TypeAndName {
    type: RegisterableType;
    name: string;
}
export interface RecursiveRegistry {
    registerType(typeAndName: TypeAndName): void;
    getType(name: string): RegisterableType;
    isRegistered(name: string): boolean;
}
