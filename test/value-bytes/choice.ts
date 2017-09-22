import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.ChoiceType<number | string>([new t.UnsignedByteType, new t.UnsignedIntType, new t.StringType])
	const gb = new GrowableBuffer
	type.writeValue(gb, 23)
	assert.equal(gb.toBuffer(), bufferFrom([0, 23]))
	assert.equal(type.readValue(gb.toBuffer()), 23)

	const gb2 = new GrowableBuffer
	type.writeValue(gb2, '12345')
	assert.equal(gb2.toBuffer(), bufferFrom([1, 0, 0, 0x30, 0x39]))
	assert.equal(type.readValue(gb2.toBuffer()), 12345)

	const gb3 = new GrowableBuffer
	type.writeValue(gb3, 'boop')
	assert.equal(gb3.toBuffer(), bufferFrom([2, 0x62, 0x6f, 0x6f, 0x70, 0]))
	assert.equal(type.readValue(gb3.toBuffer()), 'boop')

	assert.throws(
		() => type.writeValue(gb, true as any),
		'No types matched: true'
	)
}