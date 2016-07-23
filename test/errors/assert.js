/*eslint-disable no-undef*/
assert.throws(
	() => assert.throws(() => {}),
	'Should throw an error'
);
assert.throws(
	() => assert.equal({a: 2}, {a: 2, b: 3}),
	'Expected { a: 2, b: 3 } but got { a: 2 }'
);
assert.throws(
	() => assert.equal([1, 2, 3], [1, 2]),
	'Expected [ 1, 2 ] but got [ 1, 2, 3 ]'
);
assert.throws(
	() => assert.equal([1, 2, 4], [1, 2, 3]),
	'Expected [ 1, 2, 3 ] but got [ 1, 2, 4 ]'
);
assert.throws(
	() => assert.equal(new Map().set(1, 2).set(3, 4), new Map().set(1, 2)),
	'Expected Map { 1 => 2 } but got Map { 1 => 2, 3 => 4 }'
);
assert.throws(
	() => assert.equal(new Map().set(3, 4).set(1, 2), new Map().set(1, 2).set(3, 4)),
	'Expected Map { 1 => 2, 3 => 4 } but got Map { 3 => 4, 1 => 2 }'
);
assert.throws(
	() => assert.equal(new Set([1, 2, 3]), new Set([1, 2])),
	'Expected Set { 1, 2 } but got Set { 1, 2, 3 }'
);
assert.throws(
	() => assert.equal(new Set([1, 3, 2]), new Set([1, 2, 3])),
	'Expected Set { 1, 2, 3 } but got Set { 1, 3, 2 }'
);
class EqualsThrows {
	equals() {
		throw new Error('Equals is not implemented');
		return true;
	}
}
assert.throws(
	() => assert.equal(new EqualsThrows, new EqualsThrows),
	'equals() is not implemented for EqualsThrows {}'
);