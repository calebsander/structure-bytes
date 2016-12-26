/*eslint-disable no-undef*/
const type = new t.DayType
const VALUE = new Date(1468454400000 + 86400000 / 2 + new Date().getTimezoneOffset() * 60000) //noon in local timezone
const buffer = type.valueBuffer(VALUE)
assert.equal(buffer, bufferFrom([0, 0x42, 0x64]))
const readValue = r.value({buffer, type})
assert.equal(readValue.getFullYear(), VALUE.getFullYear())
assert.equal(readValue.getMonth(), VALUE.getMonth())
assert.equal(readValue.getDate(), VALUE.getDate())

const beforeEpoch = new Date(-86400000 / 2 + new Date().getTimezoneOffset() * 60000) //noon before epoch in local timezone
const beforeBuffer = type.valueBuffer(beforeEpoch)
assert.equal(beforeBuffer, bufferFrom([0xff, 0xff, 0xff]))
const beforeReadValue = r.value({buffer: beforeBuffer, type})
assert.equal(beforeReadValue.getFullYear(), beforeEpoch.getFullYear())
assert.equal(beforeReadValue.getMonth(), beforeEpoch.getMonth())
assert.equal(beforeReadValue.getDate(), beforeEpoch.getDate())