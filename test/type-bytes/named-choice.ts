import assert from '../../dist/lib/assert'
import * as constructorRegistry from '../../dist/constructor-registry'
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
	assert.equal(type.toBuffer(), bufferFrom([
		0x58,
			2,
				6, 0x51, 0x52, 0x43, 0x6f, 0x64, 0x65,
					0x51, 1, 4, 0x74, 0x65, 0x78, 0x74, 0x41,
				3, 0x55, 0x50, 0x43,
					0x51, 1, 6, 0x6e, 0x75, 0x6d, 0x62, 0x65, 0x72, 0x14
	]))
	assert.equal(r.type(type.toBuffer()), type)

	assert.throws(() => new (t.NamedChoiceType as any), 'undefined is not an instance of Map')
	assert.throws(() => new t.NamedChoiceType(new Map().set(1, 2)), '1 is not an instance of Function')
	interface Newable {
		new(): any
	}
	const tooManyConstructors: {[key: string]: Newable} = {}
	for (let i = 1; i <= 256; i++) tooManyConstructors['a'.repeat(i)] = class {}
	const tooManyTypes = new Map<Newable, t.StructType<{}>>()
	for (const name in tooManyConstructors) tooManyTypes.set(tooManyConstructors[name], new t.StructType({})) //eslint-disable-line guard-for-in
	assert.throws(() => new t.NamedChoiceType(tooManyTypes), '256 types is too many')
	assert.throws(() => { //eslint-disable-line arrow-body-style
		return new t.NamedChoiceType(new Map()
			.set(() => {}, new t.StructType({}))
		)
	}, 'Function does not have a name')
	const a = {func() {}}
	const b = {func() {}}
	assert.throws(() => { //eslint-disable-line arrow-body-style
		return new t.NamedChoiceType(new Map()
			.set(a.func, new t.StructType({}))
			.set(b.func, new t.StructType({}))
		)
	}, 'Function name "func" is repeated')
	const longConstructorName = 'c'.repeat(256)
	assert.throws(() => { //eslint-disable-line arrow-body-style
		return new t.NamedChoiceType(new Map()
			.set(constructorRegistry.get(longConstructorName), new t.StructType({}))
		)
	}, 'Function name "' + longConstructorName + '" is too long')
	assert.throws(() => { //eslint-disable-line arrow-body-style
		return new t.NamedChoiceType(new Map()
			.set(a.func, new t.UnsignedIntType)
		)
	}, 'UnsignedIntType {} is not an instance of StructType')
}