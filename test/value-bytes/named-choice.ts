import {sha256} from 'js-sha256'
import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	class QRCode {
		text: string
		constructor(text: string) {
			this.text = text
		}
	}
	class HashedQRCode extends QRCode {
		hash: string
		constructor(text: string) {
			super(text)
			const hash = sha256.create()
			hash.update(text)
			this.hash = hash.hex()
		}
	}
	class UPC {
		number: string
		constructor(number: string) {
			this.number = number
		}
	}
	const type = new t.NamedChoiceType(new Map<Function, t.StructType<QRCode | UPC>>()
		.set(QRCode, new t.StructType({
			text: new t.StringType
		}))
		.set(UPC, new t.StructType({
			number: new t.UnsignedLongType
		}))
	)
	const hashedQRCode = new HashedQRCode('abcde')
	assert.equal(hashedQRCode.hash, '36bbe50ed96841d10443bcb670d6554f0a34b761be67ec9c4a8ad2c0c44ca42c')
	const valueBuffer = type.valueBuffer(hashedQRCode)
	assert.equal(valueBuffer, bufferFrom([0, 0x61, 0x62, 0x63, 0x64, 0x65, 0]))
	const readType = r.type(type.toBuffer()) as t.NamedChoiceType<QRCode | UPC>
	const readValue = r.value({type: readType, buffer: valueBuffer}) as QRCode
	const castValue = new QRCode(hashedQRCode.text)
	assert.equal(readValue.constructor.name, castValue.constructor.name)
	assert.equal(readValue.constructor.name, 'QRCode')
	assert.equal(Object.keys(readValue), Object.keys(castValue))
	assert.equal(Object.keys(readValue), ['text'])
	assert.equal(readValue.text, castValue.text)

	const upc = new UPC('123')
	const valueBuffer2 = type.valueBuffer(upc)
	assert.equal(valueBuffer2, bufferFrom([1, 0, 0, 0, 0, 0, 0, 0, 123]))
	const readValue2 = r.value({type, buffer: valueBuffer2}) as UPC
	assert.equal(readValue2.constructor.name, upc.constructor.name)
	assert.equal(readValue2.constructor.name, 'UPC')
	assert.equal(Object.keys(readValue2), Object.keys(upc))
	assert.equal(Object.keys(readValue2), ['number'])
	assert.equal(readValue2.number, upc.number)

	assert.throws(
		() => type.valueBuffer([1, 2, 3] as any),
		'No types matched: [1, 2, 3]'
	)
	assert.throws(
		() => type.valueBuffer(new (QRCode as any)),
		'Value for field "text" missing'
	)
	assert.throws(
		() => type.valueBuffer(null as any),
		'null is not an instance of Object'
	)
}