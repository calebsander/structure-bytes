import * as t from '../../dist'
import {assert, concat} from '../test-common'

export = () => {
	const type = new t.BigIntType
	{
		const VALUE = -1234567890n
		const buffer = type.valueBuffer(VALUE)
		const bytes = [0xb6, 0x69, 0xfd, 0x2e]
		assert.deepEqual(new Uint8Array(buffer), concat([
			new Uint8Array([bytes.length]),
			new Uint8Array(bytes)
		]))
		assert.equal(type.readValue(buffer), VALUE)
	}
	{
		const buffer = type.valueBuffer(0n)
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0]))
		assert.equal(type.readValue(buffer), 0n)
	}
	{
		const buffer = type.valueBuffer(127n)
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([1, 127]))
		assert.equal(type.readValue(buffer), 127n)
	}
	{
		const buffer = type.valueBuffer(128n)
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([2, 0, 128]))
		assert.equal(type.readValue(buffer), 128n)
	}
	{
		const buffer = type.valueBuffer(-128n)
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([1, -128 & 0xff]))
		assert.equal(type.readValue(buffer), -128n)
	}
	{
		const buffer = type.valueBuffer(-256n)
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([2, -1 & 0xff, 256 & 0xff]))
		assert.equal(type.readValue(buffer), -256n)
	}

	assert.throws(
		() => type.valueBuffer([true] as any),
		(err: Error) => err.message === '[true] is not an instance of BigInt'
	)
}