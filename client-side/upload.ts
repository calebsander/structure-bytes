import {Type} from './common'
import AbstractType from '../types/abstract'

export interface UploadOptions<E> {
	type: Type<E>
	value: E
	url: string
	options: RequestInit
}
export function upload<E>({type, value, url, options}: UploadOptions<E>): Promise<Response> {
	if (!(type instanceof AbstractType)) throw new Error('Invalid type')
	if (typeof url !== 'string') throw new Error('Invalid URL')
	if (!(options instanceof Object)) throw new Error('Invalid options')
	if (options.method !== 'POST') throw new Error('Must use POST when uploading')
	options.body = type.valueBuffer(value)
	return fetch(url, options)
}
export * from './common'
(window as any).sb = exports