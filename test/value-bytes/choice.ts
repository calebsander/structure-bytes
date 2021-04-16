import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.ChoiceType<number | string>([new t.UnsignedByteType, new t.UnsignedIntType, new t.StringType])
	const gb = new GrowableBuffer
	type.writeValue(gb, 23)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0, 23]))
	assert.equal(type.readValue(gb.toBuffer()), 23)

	const gb2 = new GrowableBuffer
	type.writeValue(gb2, '12345')
	assert.deepEqual(new Uint8Array(gb2.toBuffer()), new Uint8Array([1, 0, 0, 0x30, 0x39]))
	assert.equal(type.readValue(gb2.toBuffer()), 12345)

	const gb3 = new GrowableBuffer
	type.writeValue(gb3, 'boop')
	assert.deepEqual(new Uint8Array(gb3.toBuffer()), new Uint8Array([2, 0x62, 0x6f, 0x6f, 0x70, 0]))
	assert.equal(type.readValue(gb3.toBuffer()), 'boop')

	assert.throws(
		() => type.writeValue(gb, true as any),
		(err: Error) => err.message === 'No types matched: true'
	)

	const doubleChoiceType = new t.ChoiceType<(number | string)[] | Set<number | string>>([
		new t.ArrayType(type),
		new t.SetType(type)
	])
	assert.deepEqual(
		new Uint8Array(doubleChoiceType.valueBuffer([0, '1000', '-1'])),
		new Uint8Array([
			0,
				3,
					0,
						0,
					1,
						0, 0, 1000 >> 8, 1000 & 0xFF,
					2,
						0x2d, 0x31, 0
		])
	)
	assert.deepEqual(
		new Uint8Array(doubleChoiceType.valueBuffer(new Set([0, '1000', '-1']))),
		new Uint8Array([
			1,
				3,
					0,
						0,
					1,
						0, 0, 1000 >> 8, 1000 & 0xFF,
					2,
						0x2d, 0x31, 0
		])
	)
}