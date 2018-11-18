import * as t from '../../dist'
import {assert, bufferFrom, concat} from '../test-common'

export = () => {
	const type = new t.BigUnsignedIntType
	const VALUE = '81129638414606663681390495662081' //Number.MAX_SAFE_INTEGER ** 2
	{
		const buffer = type.valueBuffer(VALUE)
		const bytes = [0x3, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]
		assert.deepEqual(new Uint8Array(buffer), concat([bufferFrom([bytes.length]), bufferFrom(bytes)]))
		assert.equal(type.readValue(buffer), VALUE)
	}
	{
		const buffer = type.valueBuffer('0')
		assert.deepEqual(new Uint8Array(buffer), bufferFrom([0]))
		assert.equal(type.readValue(buffer), '0')
	}

	assert.throws(
		() => type.valueBuffer([true] as any),
		(err: Error) => err.message === '[true] is not an instance of String'
	)
	assert.throws(
		() => type.valueBuffer('120971.00'),
		(err: Error) => err.message === 'Illegal strint format: 120971.00'
	)
	assert.throws(
		() => type.valueBuffer('-1'),
		(err: Error) => err.message === 'Value out of range'
	)
}