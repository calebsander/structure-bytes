import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	assert.throws(
		() => new t.SingletonType({} as any),
		(err: Error) => err.message === 'undefined is not an instance of AbstractType'
	)

	{
		const type = new t.SingletonType({
			type: new t.StringType,
			value: 1 as any
		})
		assert.throws(
			() => type.toBuffer(),
			(err: Error) => err.message === '1 is not an instance of String'
		)
	}

	const type = new t.SingletonType({
		type: new t.StringType,
		value: 'abc'
	})
	{
		assert.equal((type as any).cachedValueBuffer, undefined)
		const buffer = type.toBuffer()
		assert.deepEqual(
			new Uint8Array((type as any).cachedValueBuffer),
			new Uint8Array([0x61, 0x62, 0x63, 0])
		)
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x59, 0x41, 0x61, 0x62, 0x63, 0]))
		assert(type.equals(r.type(buffer)))
	}

	{
		assert(!type.equals('abc'))
		assert(!type.equals(new t.StringType))
		const equalValueBytesType = new t.SingletonType({
			type: new t.UnsignedIntType,
			value: 0x61_62_63_00
		})
		assert.deepEqual(
			new Uint8Array(equalValueBytesType.type.valueBuffer(equalValueBytesType.value)),
			new Uint8Array(type.type.valueBuffer(type.value))
		)
		assert(!type.equals(equalValueBytesType))
		assert(!type.equals(
			new t.SingletonType({
				type: new t.StringType,
				value: 'def'
			})
		))
		assert(type.equals(
			new t.SingletonType({
				type: new t.StringType,
				value: 'abc'
			})
		))
	}
}