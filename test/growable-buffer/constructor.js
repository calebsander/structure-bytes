/*eslint-disable no-undef*/
let a = new GrowableBuffer;
assert.equal(a.buffer.byteLength, 10);
a = new GrowableBuffer(100);
assert.equal(a.buffer.byteLength, 100);
for (let [invalidSize, message] of [
	[-1, '-1 is not a valid buffer length'],
	[Number.MAX_SAFE_INTEGER + 1, '9007199254740992 is not a valid buffer length'],
	[null, 'null is not a valid buffer length'],
	[true, 'true is not a valid buffer length'],
	['abc', 'abc is not a valid buffer length']
]) {
	assert.throws(
		() => new GrowableBuffer(invalidSize),
		message
	);
}