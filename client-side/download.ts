import * as base64 from 'base64-js'
import {Type} from './common'
import * as r from '../read'

interface Sig {
	sig: string
}
interface SigAndType extends Sig {
	type: Type<unknown>
}
interface TypeCache {
	[name: string]: SigAndType
}
interface SigAndBuffer extends Sig {
	type: string
}
interface ComposedCache {
	[name: string]: SigAndBuffer
}

const typeCache: TypeCache = {}
function saveTypeCache() {
	const composedCache: ComposedCache = {}
	for (const type in typeCache) {
		composedCache[type] = {
			sig: typeCache[type].sig,
			type: base64.fromByteArray(new Uint8Array(typeCache[type].type.toBuffer()))
		}
	}
	localStorage.typeCache = JSON.stringify(composedCache)
}
if (localStorage.typeCache) {
	const composedCache: ComposedCache = JSON.parse(localStorage.typeCache)
	for (const typeName in composedCache) {
		typeCache[typeName] = {
			sig: composedCache[typeName].sig,
			type: r.type(base64.toByteArray(composedCache[typeName].type).buffer)
		}
	}
}

export interface DownloadOptions {
	name: string
	url: string
	options?: RequestInit
}
export function download({name, url, options}: DownloadOptions): Promise<unknown> {
	if (typeof name !== 'string') throw new Error('Name is not a string')
	if (typeof url !== 'string') throw new Error('URL is not a string')
	options = options || {}
	if (!(options instanceof Object)) throw new Error('Invalid options object')

	const typeInCache = typeCache[name]
	if (typeInCache) {
		if (options.headers) {
			const {headers} = options
			if (headers.constructor !== Headers) options.headers = new Headers(headers)
		}
		else options.headers = new Headers
		;(options.headers as Headers).set('sig', typeCache[name].sig)
	}
	return fetch(url, options)
		.then(response => {
			if (!response.ok) throw new Error(`Received status of ${response.status}`)
			const sig = response.headers.get('sig')
			if (!sig) throw new Error('Missing type signature')
			return response.arrayBuffer()
				.then(buffer => {
					if (typeInCache && typeInCache.sig === sig) {
						return typeInCache.type.readValue(buffer)
					}

					const readType = r._consumeType(buffer, 0)
					const type = readType.value
					const value = type.readValue(buffer, readType.length)
					typeCache[name] = {sig, type}
					saveTypeCache()
					return value
				})
		})
}
export * from './common'
(window as unknown as Record<string, unknown>).sb = exports