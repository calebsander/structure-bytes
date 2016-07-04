let a = new GrowableBuffer();
assert.equal(a.buffer.length, 10);
a = new GrowableBuffer(100);
assert.equal(a.buffer.length, 100);
for (let invalidSize of [-1, Number.MAX_SAFE_INTEGER + 1, null, true, 'abc']) {
	assert.throws(() => new GrowableBuffer(invalidSize));
}