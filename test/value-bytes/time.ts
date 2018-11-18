import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

export = () => {
	const type = new t.TimeType
	const VALUE = new Date(Math.floor(Math.random() * 20000) * 86400000 + 0xbc614e)
	const buffer = type.valueBuffer(VALUE)
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0, 0xbc, 0x61, 0x4e]))
	assert.equal(type.readValue(buffer).getTime(), 12345678)
}