/*eslint-disable no-undef*/
const sha256 = require('sha256')

class QRCode {
	constructor(text) {
		this.text = text
	}
}
class HashedQRCode extends QRCode {
	constructor(text) {
		super(text)
		this.hash = sha256(text)
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
const hashedQRCode = new HashedQRCode('abcde')
assert.equal(hashedQRCode.hash, '36bbe50ed96841d10443bcb670d6554f0a34b761be67ec9c4a8ad2c0c44ca42c')
let valueBuffer = type.valueBuffer(hashedQRCode)
assert.equal(valueBuffer, bufferFrom([0, 0x61, 0x62, 0x63, 0x64, 0x65, 0]))
const readType = r.type(type.toBuffer())
let readValue = r.value({type: readType, buffer: valueBuffer})
const castValue = new QRCode(hashedQRCode.text)
assert.equal(readValue.constructor.name, castValue.constructor.name)
assert.equal(readValue.constructor.name, 'QRCode')
assert.equal(Object.keys(readValue), Object.keys(castValue))
assert.equal(Object.keys(readValue), ['text'])
assert.equal(readValue.text, castValue.text)
const upc = new UPC('123')
valueBuffer = type.valueBuffer(upc)
assert.equal(valueBuffer, bufferFrom([1, 0, 0, 0, 0, 0, 0, 0, 123]))
readValue = r.value({type, buffer: valueBuffer})
assert.equal(readValue.constructor.name, upc.constructor.name)
assert.equal(readValue.constructor.name, 'UPC')
assert.equal(Object.keys(readValue), Object.keys(upc))
assert.equal(Object.keys(readValue), ['number'])
assert.equal(readValue.number, upc.number)

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