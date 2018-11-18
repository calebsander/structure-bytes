import {strict as assert} from 'assert'
import * as flexInt from '../../dist/lib/flex-int'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom, concat} from '../test-common'

export = () => {
	{
		const octetPointers = new t.PointerType(
			new t.ArrayType(
				new t.UnsignedByteType
			)
		)
		const type = new t.StructType({
			a: octetPointers,
			b: octetPointers,
			c: octetPointers
		})
		const gb = new GrowableBuffer
		const VALUE = {
			a: [100, 101, 102, 103, 104],
			b: [100, 101, 102, 103, 104],
			c: [100, 101, 102, 103, 104]
		}
		type.writeValue(gb, VALUE)
		assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([
			0,
				5, 100, 101, 102, 103, 104,
			7,
			1
		]))
		assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)
	}

	{
		const type = new t.TupleType({
			type: new t.PointerType(new t.LongType),
			length: 5
		})
		const gb = new GrowableBuffer
		const VALUE = ['1234567890', '0', '0', '2', '0']
		type.writeValue(gb, VALUE)
		assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([
			0,
				0, 0, 0, 0, 0x49, 0x96, 0x02, 0xd2,
			0,
				0, 0, 0, 0, 0, 0, 0, 0,
			9,
			0,
				0, 0, 0, 0, 0, 0, 0, 2,
			10
		]))
		assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)
	}

	{
		const type = new t.TupleType({
			type: new t.PointerType(new t.StringType),
			length: 10
		})
		const gb = new GrowableBuffer
		const tuple = []
		for (let i = 0; i < 10; i++) tuple[i] = '0abc0'
		type.writeValue(gb, tuple)
		assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([
			0,
				0x30, 0x61, 0x62, 0x63, 0x30, 0,
			7,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1
		]))
		assert.deepEqual(type.readValue(gb.toBuffer()), tuple)
	}

	{
		const type = new t.OptionalType(
			new t.PointerType(
				new t.UnsignedShortType
			)
		)
		const gb = new GrowableBuffer
		type.writeValue(gb, 123)
		assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([
			0xff,
				0,
					0, 123
		]))
		assert.equal(type.readValue(gb.toBuffer()), 123)
	}

	{
		const type = new t.MapType(
			new t.PointerType(new t.StringType),
			new t.PointerType(new t.ByteType)
		)
		const gb = new GrowableBuffer
		const map = new Map<string, number>().set('abc', -126).set('def', -126)
		type.writeValue(gb, map)
		assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([
			2,
				0,
					0x61, 0x62, 0x63, 0,
				0,
					-126 + 256,
				0,
					0x64, 0x65, 0x66, 0,
				7
		]))
		assert.deepEqual(type.readValue(gb.toBuffer()), map)
	}

	//Reading a value being pointed to twice should always give the same value
	const threeDVectorType = new t.PointerType(
		new t.TupleType<number>({
			type: new t.FloatType,
			length: 3
		})
	)
	const duplicateType = new t.StructType({
		a: threeDVectorType,
		b: threeDVectorType
	})
	const buffer = duplicateType.valueBuffer({a: [2, 0, 1], b: [2, 0, 1]})
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([
		0,
			0x40, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x3f, 0x80, 0x00, 0x00,
		13
	]))
	const valueReadBack = duplicateType.readValue(buffer)
	assert.equal(valueReadBack.a, valueReadBack.b)

	//Different types should be able to use the same pointer location if value bytes are equivalent
	{
		const type = new t.StructType({
			number: new t.PointerType(new t.UnsignedShortType),
			string: new t.PointerType(new t.StringType)
		})
		const value = {
			string: 'a',
			number: 'a'.charCodeAt(0) << 8
		}
		const buffer = type.valueBuffer(value)
		assert.deepEqual(new Uint8Array(buffer), bufferFrom([
			0,
				0x61, 0,
			3
		]))
		assert.deepEqual(type.readValue(buffer), value)
	}

	//Test with offset requiring 2 flexInt bytes
	{
		const type = new t.ArrayType(
			new t.PointerType(
				new t.UnsignedByteType
			)
		)
		const value: number[] = []
		const bytes: number[] = []
		for (let n = 1; n <= 100; n++) {
			value.push(n)
			bytes.push(0, n)
		}
		value.push(1, 1)
		const buffer = type.valueBuffer(value)
		assert.deepEqual(new Uint8Array(buffer), concat([
			bufferFrom([value.length]),
			bufferFrom(bytes),
			new Uint8Array(flexInt.makeValueBuffer(100 * 2)),
			bufferFrom([2])
		]))
		assert.deepEqual(type.readValue(buffer), value)
	}
}