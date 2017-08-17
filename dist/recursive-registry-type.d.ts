import { ArrayType, MapType, SetType, StructType, TupleType } from './structure-types';
export declare type RegisterableType = ArrayType<any> | MapType<any, any> | SetType<any> | StructType<any> | TupleType<any>;
export interface TypeAndName {
    type: RegisterableType;
    name: string;
}
export interface RecursiveRegistry {
    registerType(typeAndName: TypeAndName): void;
    getType(name: string): RegisterableType;
    isRegistered(name: string): boolean;
}
