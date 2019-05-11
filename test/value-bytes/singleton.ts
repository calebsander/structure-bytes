import * as t from '../../dist'
import {assert} from '../test-common'

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
			(err: Error) => err.message === '2748 is not an instance of String'
		)
		assert.equal((type as any).cachedValueBuffer, undefined)
		assert.throws(
			() => type.valueBuffer('def'),
			(err: Error) => err.message === 'Expected "abc" but got "def"'
		)
		assert.deepEqual(new Uint8Array((type as any).cachedValueBuffer), new Uint8Array([0x61, 0x62, 0x63, 0]))
		const valueBuffer = type.valueBuffer('abc')
		assert.deepEqual(new Uint8Array(valueBuffer), new Uint8Array())
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
		assert.deepEqual(
			new Uint8Array(type.valueBuffer({type: 'boolean', value: true})),
			new Uint8Array([0, 0xFF])
		)
		assert.deepEqual(
			new Uint8Array(type.valueBuffer({type: 'number', value: 1})),
			new Uint8Array([1, 0x3F, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
		)
		assert.deepEqual(
			new Uint8Array(type.valueBuffer({type: 'string', value: ''})),
			new Uint8Array([2, 0])
		)
		assert.throws(
			() => type.valueBuffer({type: 'boolean', value: 2 as any}),
			(err: Error) => err.message === 'No types matched: {type: "boolean", value: 2}'
		)
		assert.throws(
			() => type.valueBuffer({type: 'something-else' as any, value: '123'}),
			(err: Error) =>
				err.message === 'No types matched: {type: "something-else", value: "123"}'
		)
		assert.throws(
			() => type.valueBuffer({type: [3] as any, value: false}),
			(err: Error) => err.message === 'No types matched: {type: [3], value: false}'
		)
	}
}