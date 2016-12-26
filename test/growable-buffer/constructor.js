/*eslint-disable no-undef*/
const gb = new GrowableBuffer
assert.equal(gb.buffer.byteLength, 10)
const gb2 = new GrowableBuffer(100)
assert.equal(gb2.buffer.byteLength, 100)
for (const [invalidSize, message] of [
	[-1, '-1 is not a valid buffer length'],
	[Number.MAX_SAFE_INTEGER + 1, '9007199254740992 is not a valid buffer length'],
	[null, 'null is not a valid buffer length'],
	[true, 'true is not a valid buffer length'],
	['abc', 'abc is not a valid buffer length']
]) {
	assert.throws(
		() => new GrowableBuffer(invalidSize),
		message
	)
}