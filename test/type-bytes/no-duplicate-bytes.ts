import {REPEATED_TYPE} from '../../dist/lib/constants'
import * as t from '../../dist/types'
import {assert} from '../test-common'

interface TypesOnly {
	[name: string]: typeof import('../../dist/types/abstract').default
}

export = () => {
	const usedBytes = new Set([REPEATED_TYPE])
	for (const typeName in t) {
		let typeByte: number
		try {
			typeByte = (t as any as TypesOnly)[typeName]._value
		}
		catch (e) {
			assert(e.message === 'Generic Type has no value byte')
			continue
		}
		assert(!usedBytes.has(typeByte), `Type byte ${typeByte} is used twice`)
		usedBytes.add(typeByte)
	}
}