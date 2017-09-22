import assert from '../../dist/lib/assert'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.TimeType
	const VALUE = new Date(Math.floor(Math.random() * 20000) * 86400000 + 0xbc614e)
	const buffer = type.valueBuffer(VALUE)
	assert.equal(buffer, bufferFrom([0, 0xbc, 0x61, 0x4e]))
	assert.equal(type.readValue(buffer).getTime(), 12345678)
}