import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.StringType
	for (const [invalidValue, message] of [
		[undefined, 'undefined is not an instance of String'],
		[null, 'null is not an instance of String'],
		[2, '2 is not an instance of String'],
		[false, 'false is not an instance of String'],
		[['abc'], '["abc"] is not an instance of String']
	]) {
		assert.throws(
			() => type.valueBuffer(invalidValue as any),
			message as string
		)
	}

	const STRING = 'abç'
	const gb = new GrowableBuffer
	type.writeValue(gb, STRING)
	assert.equal(gb.toBuffer(), bufferFrom([0x61, 0x62, 0xc3, 0xa7, 0]))
	assert.equal(r.value({buffer: gb.toBuffer(), type}), STRING)
}