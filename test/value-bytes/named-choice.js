/*eslint-disable no-undef*/
class QRCode {
	constructor(text) {
		this.text = text
	}
}
class UPC {
	constructor(number) {
		this.number = number
	}
}
let type = new t.NamedChoiceType(new Map()
	.set(QRCode, new t.StructType({
		text: new t.StringType
	}))
	.set(UPC, new t.StructType({
		number: new t.UnsignedLongType
	}))
)
let valueBuffer = type.valueBuffer(new QRCode('abcde'))
assert.equal(valueBuffer, bufferFrom([0, 0x61, 0x62, 0x63, 0x64, 0x65, 0]))
valueBuffer = type.valueBuffer(new UPC('123'))
assert.equal(valueBuffer, bufferFrom([1, 0, 0, 0, 0, 0, 0, 0, 123]))
assert.throws(
	() => type.valueBuffer([1, 2, 3]),
	'No types matched: [ 1, 2, 3 ]'
)
assert.throws(
	() => type.valueBuffer(new QRCode),
	'Value for field "text" missing'
)
assert.throws(
	() => type.valueBuffer(null),
	'null is not an instance of Object'
)