/*eslint-disable no-undef*/
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
assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 5, 100, 101, 102, 103, 104]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)

const type2 = new t.PointerType(new t.LongType)
const gb2 = new GrowableBuffer
type2.writeValue(gb2, '1234567890')
assert.equal(gb2.toBuffer(), bufferFrom([0, 0, 0, 4, 0, 0, 0, 0, 0x49, 0x96, 0x02, 0xd2]))
assert.equal(r.value({buffer: gb2.toBuffer(), type: type2}), '1234567890')

const type3 = new t.TupleType({
	type: new t.PointerType(new t.StringType),
	length: 10
})
const gb3 = new GrowableBuffer
const tuple = []
for (let i = 0; i < 10; i++) tuple[i] = '0abc0'
type3.writeValue(gb3, tuple)
assert.equal(gb3.toBuffer(), bufferFrom([0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0x30, 0x61, 0x62, 0x63, 0x30, 0]))
assert.equal(r.value({buffer: gb3.toBuffer(), type: type3}), tuple)

const type4 = new t.OptionalType(new t.PointerType(new t.UnsignedShortType))
const gb4 = new GrowableBuffer
type4.writeValue(gb4, 123)
assert.equal(gb4.toBuffer(), bufferFrom([0xFF, 0, 0, 0, 5, 0, 123]))
assert.equal(r.value({buffer: gb4.toBuffer(), type: type4}), 123)

const type5 = new t.MapType(
	new t.PointerType(new t.StringType),
	new t.PointerType(new t.ByteType)
)
const gb5 = new GrowableBuffer
const map = new Map().set('abc', -126).set('def', -126)
type5.writeValue(gb5, map)
assert.equal(gb5.toBuffer(), bufferFrom([0, 0, 0, 2, 0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 25, 0, 0, 0, 24, 0x61, 0x62, 0x63, 0, -126 + 256, 0x64, 0x65, 0x66, 0]))
assert.equal(r.value({buffer: gb5.toBuffer(), type: type5}), map)

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
assert.assert(valueReadBack.a !== valueReadBack.b)