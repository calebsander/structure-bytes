/*eslint-disable no-undef*/
let type = new t.DayType;
const VALUE = new Date(1468454400000 + 86400000 / 2 + new Date().getTimezoneOffset() * 60000); //noon in local timezone
const buffer = type.valueBuffer(VALUE);
assert.equal(buffer, bufferFrom([0, 0x42, 0x64]));
const readValue = r.value({buffer, type});
assert.equal(readValue.getFullYear(), VALUE.getFullYear());
assert.equal(readValue.getMonth(), VALUE.getMonth());
assert.equal(readValue.getDate(), VALUE.getDate());