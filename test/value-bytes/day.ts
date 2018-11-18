import {strict as assert} from 'assert'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.DayType
	const VALUE = new Date(1468454400000 + 86400000 / 2 + new Date().getTimezoneOffset() * 60000) //noon in local timezone
	const buffer = type.valueBuffer(VALUE)
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0, 0x42, 0x64]))
	const readValue = type.readValue(buffer)
	assert.equal(readValue.getFullYear(), VALUE.getFullYear())
	assert.equal(readValue.getMonth(), VALUE.getMonth())
	assert.equal(readValue.getDate(), VALUE.getDate())

	const beforeEpoch = new Date(-86400000 / 2 + new Date().getTimezoneOffset() * 60000) //noon before epoch in local timezone
	const beforeBuffer = type.valueBuffer(beforeEpoch)
	assert.deepEqual(new Uint8Array(beforeBuffer), bufferFrom([0xff, 0xff, 0xff]))
	const beforeReadValue = type.readValue(beforeBuffer)
	assert.equal(beforeReadValue.getFullYear(), beforeEpoch.getFullYear())
	assert.equal(beforeReadValue.getMonth(), beforeEpoch.getMonth())
	assert.equal(beforeReadValue.getDate(), beforeEpoch.getDate())
}