/*eslint-disable no-undef*/
assert.throws(
	() => assert.throws(() => {}),
	'Should throw an error'
)
assert.throws(
	() => assert.equal({a: 2}, {a: 2, b: 3}),
	'Expected { a: 2, b: 3 } but got { a: 2 }'
)
assert.throws(
	() => assert.equal([1, 2, 3], [1, 2]),
	'Expected [ 1, 2 ] but got [ 1, 2, 3 ]'
)
assert.throws(
	() => assert.equal([1, 2, 4], [1, 2, 3]),
	'Expected [ 1, 2, 3 ] but got [ 1, 2, 4 ]'
)
assert.throws(
	() => assert.equal(new Map().set(1, 2).set(3, 4), new Map().set(1, 2)),
	'Expected Map { 1 => 2 } but got Map { 1 => 2, 3 => 4 }'
)
assert.throws(
	() => assert.equal(new Map().set(3, 4).set(1, 2), new Map().set(1, 2).set(3, 4)),
	'Expected Map { 1 => 2, 3 => 4 } but got Map { 3 => 4, 1 => 2 }'
)
assert.throws(
	() => assert.equal(new Set([1, 2, 3]), new Set([1, 2])),
	'Expected Set { 1, 2 } but got Set { 1, 2, 3 }'
)
assert.throws(
	() => assert.equal(new Set([1, 3, 2]), new Set([1, 2, 3])),
	'Expected Set { 1, 2, 3 } but got Set { 1, 3, 2 }'
)
assert.throws(
	() => assert.equal(bufferFrom([1, 2, 3, 4]), bufferFrom([1, 2, 3])),
	'Expected ArrayBuffer { byteLength: 3 } but got ArrayBuffer { byteLength: 4 }'
)
assert.throws(
	() => assert.equal(bufferFrom([1, 2, 5]), bufferFrom([1, 2, 3])),
	'Expected ArrayBuffer { byteLength: 3 } but got ArrayBuffer { byteLength: 3 }'
)
let a = {func() {}},
	b = {func() {}}
assert.throws(
	() => assert.assert(a.func === b.func, 'Unequal'),
	'Unequal'
)
assert.equal(a.func, b.func)
class EqualsThrows {
	equals() {
		throw new Error('Equals is not implemented')
	}
}
assert.throws(
	() => assert.equal(new EqualsThrows, new EqualsThrows),
	'equals() is not implemented for EqualsThrows {}'
)
assert.throws(
	() => assert.message(null, 'Error occurred'),
	'Message "No error thrown" does not start with "Error occurred"'
)
for (let Type of [Array, Map, Set, ArrayBuffer]) {
	let value = new Type
	assert.throws(
		() => assert.equal(undefined, value),
		'Expected ' + require('util').inspect(value) + ' but got undefined'
	)
	assert.throws(
		() => assert.equal(25, value),
		'Expected ' + require('util').inspect(value) + ' but got 25'
	)
}
assert.throws(
	() => assert.equal(Buffer.from([1, 0, 3]), Buffer.from([1, 2, 3])),
	'Expected <Buffer 01 02 03> but got <Buffer 01 00 03>'
)
assert.throws(
	() => assert.equal(Buffer.from([1, 2]), Buffer.from([1, 2, 3])),
	'Expected <Buffer 01 02 03> but got <Buffer 01 02>'
)
assert.throws(
	() => assert.equal(Buffer.from([1, 2, 3, 4]), Buffer.from([1, 2, 3])),
	'Expected <Buffer 01 02 03> but got <Buffer 01 02 03 04>'
)