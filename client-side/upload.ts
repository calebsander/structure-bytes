import {assert, Type} from './common'
import AbstractType from '../types/abstract'

export interface UploadOptions<E> {
	type: Type<E>
	value: E
	url: string
	options: RequestInit
}
export function upload<E>({type, value, url, options}: UploadOptions<E>): Promise<Response> {
	assert.instanceOf(type, AbstractType)
	assert.instanceOf(url, String)
	assert.instanceOf(options, Object)
	if (options.method !== 'POST') assert.fail('Must use POST when uploading')
	options.body = type.valueBuffer(value)
	return fetch(url, options)
}
export * from './common'
(window as any).sb = exports