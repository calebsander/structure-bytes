import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	assert.throws(
		() => new t.SingletonType({} as any),
		'undefined is not an instance of AbstractType'
	)

	{
		const type = new t.SingletonType({
			type: new t.StringType,
			value: 1 as any
		})
		assert.throws(
			() => type.toBuffer(),
			'1 is not an instance of String'
		)
	}

	const type = new t.SingletonType({
		type: new t.StringType,
		value: 'abc'
	})
	{
		assert.equal((type as any).cachedValueBuffer, undefined)
		const buffer = type.toBuffer()
		assert.equal((type as any).cachedValueBuffer, bufferFrom([0x61, 0x62, 0x63, 0]))
		assert.equal(buffer, bufferFrom([0x59, 0x41, 0x61, 0x62, 0x63, 0]))
		assert.equal(r.type(buffer), type)
	}

	{
		assert(!type.equals('abc'))
		assert(!type.equals(new t.StringType))
		const equalValueBytesType = new t.SingletonType({
			type: new t.UnsignedIntType,
			value: 0x61_62_63_00
		})
		assert.equal(
			equalValueBytesType.type.valueBuffer(equalValueBytesType.value),
			type.type.valueBuffer(type.value)
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