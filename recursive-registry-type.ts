import {ArrayType, MapType, SetType, StructType, TupleType} from './types'

export type RegisterableType
	= ArrayType<unknown>
	| MapType<unknown, unknown>
	| SetType<unknown>
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	| StructType<any>
	| TupleType<unknown>

export interface TypeAndName {
	type: RegisterableType
	name: string
}

export interface RecursiveRegistry {
	registerType(typeAndName: TypeAndName): void
	getType(name: string): RegisterableType
	isRegistered(name: string): boolean
}