import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	{
		const octetPointers = new t.PointerType(
			new t.ArrayType(
				new t.UnsignedByteType
			)
		)
		const type = new t.StructType({
			a: octetPointers,
			b: octetPointers
		})
		const gb = new GrowableBuffer
		const VALUE = {
			a: [100, 101, 102, 103, 104],
			b: [100, 101, 102, 103, 104]
		}
		type.writeValue(gb, VALUE)
		assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0, 8, 0, 0, 0, 8, 5, 100, 101, 102, 103, 104]))
		assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)
	}

	{
		const type = new t.PointerType(new t.LongType)
		const gb = new GrowableBuffer
		type.writeValue(gb, '1234567890')
		assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0, 4, 0, 0, 0, 0, 0x49, 0x96, 0x02, 0xd2]))
		assert.equal(r.value({buffer: gb.toBuffer(), type}), '1234567890')
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
		assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0x30, 0x61, 0x62, 0x63, 0x30, 0]))
		assert.equal(r.value({buffer: gb.toBuffer(), type}), tuple)
	}

	{
		const type = new t.OptionalType(
			new t.PointerType(
				new t.UnsignedShortType
			)
		)
		const gb = new GrowableBuffer
		type.writeValue(gb, 123)
		assert.equal(gb.toBuffer(), bufferFrom([0xFF, 0, 0, 0, 5, 0, 123]))
		assert.equal(r.value({buffer: gb.toBuffer(), type}), 123)
	}

	{
		const type = new t.MapType(
			new t.PointerType(new t.StringType),
			new t.PointerType(new t.ByteType)
		)
		const gb = new GrowableBuffer
		const map = new Map<string, number>().set('abc', -126).set('def', -126)
		type.writeValue(gb, map)
		assert.equal(gb.toBuffer(), bufferFrom([2, 0, 0, 0, 17, 0, 0, 0, 21, 0, 0, 0, 22, 0, 0, 0, 21, 0x61, 0x62, 0x63, 0, -126 + 256, 0x64, 0x65, 0x66, 0]))
		assert.equal(r.value({buffer: gb.toBuffer(), type}), map)
	}

	//Note that reading a value being pointed to twice can result in different values
	const threeDVectorType = new t.PointerType(
		new t.TupleType({
			type: new t.FloatType,
			length: 3
		})
	)
	const duplicateType = new t.StructType({
		a: threeDVectorType,
		b: threeDVectorType
	})
	const vector = [2, 0, 1]
	const valueBuffer = duplicateType.valueBuffer({a: vector, b: vector})
	assert.equal(valueBuffer, bufferFrom([0, 0, 0, 8, 0, 0, 0, 8, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0x80, 0x00, 0x00]))
	const valueReadBack = r.value({buffer: valueBuffer, type: duplicateType})
	assert(valueReadBack.a !== valueReadBack.b)
}