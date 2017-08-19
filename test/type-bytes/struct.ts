import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.StructType({
		bobbé: new t.BooleanType,
		'': new t.IntType
	})
	const buffer = type.toBuffer()
	assert.equal(buffer, bufferFrom([0x51, 2, 0, 0x03, 6, 0x62, 0x6f, 0x62, 0x62, 0xc3, 0xa9, 0x30]))
	assert.equal(r.type(buffer), type)
	for (let i = 0; i < buffer.byteLength; i++) {
		assert.throws(
			() => r.type(buffer.slice(0, i)),
			'Buffer is not long enough'
		)
	}

	//Test invalid field request
	assert.throws(
		() => {
			const struct: {[field: string]: t.Type<any>} = {}
			for (let i = 1; i <= 256; i++) struct[(i % 2 ? 'a' : 'b').repeat(Math.floor(i / 2))] = new t.IntType
			new t.StructType(struct)
		},
		'256 fields is too many'
	)
	const longString = 'a'.repeat(256)
	assert.throws(
		() => new t.StructType({
			[longString]: new t.ByteType
		}),
		'Field name ' + longString + ' is too long'
	)
	assert.throws(
		() => new t.StructType({
			field: 'abc'
		}),
		'"abc" is not a valid field type'
	)

	//Test hasOwnProperty()
	class TestClass {
		one: t.StringType
		two: t.CharType
		constructor() {
			this.one = new t.StringType
			this.two = new t.CharType
		}
	}
	(TestClass.prototype as any).abc = () => 23
	const testObject = new TestClass
	let foundKey = false
	for (const key in testObject) {
		if (key === 'abc') {
			foundKey = true
			break
		}
	}
	assert(foundKey, 'Expected "abc" to be a key in testObject')
	const testStruct = new t.StructType(testObject)
	assert.equal(testStruct.fields.map(field => field.name), ['one', 'two'])

	const type1 = new t.StructType({
		a: new t.IntType,
		b: new t.ByteType
	})
	const type2 = new t.IntType
	assert(!type1.equals(type2))
	const type3 = new t.StructType({})
	assert(!type1.equals(type3))
	const type4 = new t.StructType({
		a: new t.ByteType,
		b: new t.IntType
	})
	assert(!type1.equals(type4))
	const type5 = new t.StructType({
		a: new t.IntType,
		c: new t.ByteType
	})
	assert(!type1.equals(type5))
	const type6 = new t.StructType({
		a: new t.IntType,
		b: new t.ByteType,
		c: new t.StringType
	})
	assert(!type1.equals(type6))
	const type7 = new t.StructType({
		b: new t.ByteType,
		a: new t.IntType
	})
	assert(type1.equals(type7))
}