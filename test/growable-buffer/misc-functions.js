/*eslint-disable no-undef*/
let gb = new GrowableBuffer
for (let i = 0; i < 10; i++) gb.addAll(bufferString.fromString('abc'))
let gb2 = new GrowableBuffer
gb2.addAll(bufferString.fromString('abc'.repeat(10)))
assert.equal(gb.toBuffer(), gb2.toBuffer())
gb = new GrowableBuffer
for (let i = 0; i < 100; i++) {
	assert.throws(
		() => gb.set(i, i),
		'Index out of bounds: '
	)
	gb.add(i)
}
let buffer = bufferFill(4, 0xbe)
for (let i = 0; i < 100; i++) {
	if (i > 96) {
		assert.throws(
			() => gb.setAll(i, buffer),
			'Index out of bounds: 9'
		)
	}
	else gb.setAll(i, buffer)
}
for (let i = 0; i < gb.length; i++) assert.equal(gb.get(i), 0xbe)
gb = new GrowableBuffer
gb.add(1).add(2).add(3)
gb.set(2, 6).set(1, 5).set(0, 4)
assert.equal(gb.toBuffer(), bufferFrom([4, 5, 6]))
assert.throws(
	() => gb.set(1, 256),
	'Not a byte: 256 (256 is not in [0,256))'
)