import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.TimeType
	const VALUE = new Date(Math.floor(Math.random() * 20000) * 86400000 + 0xbc614e)
	const buffer = type.valueBuffer(VALUE)
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0, 0xbc, 0x61, 0x4e]))
	assert.equal(type.readValue(buffer).getTime(), 12345678)
}