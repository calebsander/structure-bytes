import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.StringType
	for (const [invalidValue, message] of [
		[undefined, 'undefined is not an instance of String'],
		[null, 'null is not an instance of String'],
		[2, '2 is not an instance of String'],
		[false, 'false is not an instance of String'],
		[['abc'], '["abc"] is not an instance of String']
	] as [any, string][]) {
		assert.throws(
			() => type.valueBuffer(invalidValue),
			(err: Error) => err.message === message
		)
	}

	const STRING = 'abç'
	const gb = new GrowableBuffer
	type.writeValue(gb, STRING)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0x61, 0x62, 0xc3, 0xa7, 0]))
	assert.equal(type.readValue(gb.toBuffer()), STRING)
}