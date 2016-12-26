/*eslint-disable no-undef*/
const type = new t.ChoiceType([new t.UnsignedByteType, new t.UnsignedIntType, new t.StringType])
const gb = new GrowableBuffer
type.writeValue(gb, 23)
assert.equal(gb.toBuffer(), bufferFrom([0, 23]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), 23)

const gb2 = new GrowableBuffer
type.writeValue(gb2, 12345)
assert.equal(gb2.toBuffer(), bufferFrom([1, 0, 0, 0x30, 0x39]))
assert.equal(r.value({buffer: gb2.toBuffer(), type}), 12345)

const gb3 = new GrowableBuffer
type.writeValue(gb3, 'boop')
assert.equal(gb3.toBuffer(), bufferFrom([2, 0x62, 0x6f, 0x6f, 0x70, 0]))
assert.equal(r.value({buffer: gb3.toBuffer(), type}), 'boop')

assert.throws(
	() => type.writeValue(gb, true),
	'No types matched: true'
)