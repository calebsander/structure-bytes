import assert from '../../dist/lib/assert'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

type JSONLiteral
	= {type: 'boolean', value: boolean}
	| {type: 'number', value: number}
	| {type: 'string', value: string}

export = () => {
	{
		const type = new t.SingletonType({
			type: new t.StringType,
			value: 'abc'
		})
		assert.throws(
			() => type.valueBuffer(0xabc as any),
			'Expected "abc" but got 2748'
		)
		assert.equal((type as any).cachedValueBuffer, undefined)
		assert.throws(
			() => type.valueBuffer('def'),
			'Expected "abc" but got "def"'
		)
		assert.equal((type as any).cachedValueBuffer, bufferFrom([0x61, 0x62, 0x63, 0]))
		const valueBuffer = type.valueBuffer('abc')
		assert.equal(valueBuffer, bufferFrom([]))
		assert.equal(type.readValue(valueBuffer), 'abc')
	}

	{
		const type = new t.ChoiceType<JSONLiteral>([
			new t.StructType({
				type: new t.SingletonType<'boolean'>({
					type: new t.StringType,
					value: 'boolean'
				}),
				value: new t.BooleanType
			}),
			new t.StructType({
				type: new t.SingletonType<'number'>({
					type: new t.StringType,
					value: 'number'
				}),
				value: new t.DoubleType as t.Type<number>
			}),
			new t.StructType({
				type: new t.SingletonType<'string'>({
					type: new t.StringType,
					value: 'string'
				}),
				value: new t.StringType
			})
		])
		assert.equal(
			type.valueBuffer({type: 'boolean', value: true}),
			bufferFrom([0, 0xFF])
		)
		assert.equal(
			type.valueBuffer({type: 'number', value: 1}),
			bufferFrom([1, 0x3F, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
		)
		assert.equal(
			type.valueBuffer({type: 'string', value: ''}),
			bufferFrom([2, 0])
		)
		assert.throws(
			() => type.valueBuffer({type: 'boolean', value: 2 as any}),
			'No types matched: {type: "boolean", value: 2}'
		)
		assert.throws(
			() => type.valueBuffer({type: 'something-else' as any, value: '123'}),
			'No types matched: {type: "something-else", value: "123"}'
		)
		assert.throws(
			() => type.valueBuffer({type: [3] as any, value: false}),
			'No types matched: {type: [3], value: false}'
		)
	}
}