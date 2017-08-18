import assert from '../../dist/lib/assert'
import {REPEATED_TYPE} from '../../dist/lib/constants'
import * as t from '../../dist/types'
import AbstractType from '../../dist/types/abstract'

interface TypesOnly {
	[name: string]: typeof AbstractType
}

export = () => {
	const usedBytes = new Set([REPEATED_TYPE])
	for (const typeName in t) {
		let typeByte: number
		try {
			typeByte = ((t as any) as TypesOnly)[typeName]._value
		}
		catch (e) {
			assert.errorMessage(e, 'Generic Type has no value byte')
			continue
		}
		if (usedBytes.has(typeByte)) assert.fail('Type byte ' + String(typeByte) + ' is used twice')
		usedBytes.add(typeByte)
	}
}