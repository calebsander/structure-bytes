/*eslint-disable no-undef*/
let gb = new GrowableBuffer;
for (let i = 0; i < 10; i++) gb.addAll(bufferString.fromString('abc'));
let gb2 = new GrowableBuffer;
gb2.addAll(bufferString.fromString('abc'.repeat(10)));
assert.equal(gb.toBuffer(), gb2.toBuffer());
gb = new GrowableBuffer;
for (let i = 0; i < 100; i++) {
	assert.throws(
		() => gb.set(i, i),
		'Index out of bounds: '
	);
	gb.add(i);
}
let buffer = bufferFill(4, 0xbe);
for (let i = 0; i < 100; i++) {
	if (i > 96) {
		assert.throws(
			() => gb.setAll(i, buffer),
			'Index out of bounds: 9'
		);
	}
	else gb.setAll(i, buffer);
}
for (let i = 0; i < gb.length; i++) assert.equal(gb.get(i), 0xbe);