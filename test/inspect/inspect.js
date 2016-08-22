/*eslint-disable no-undef*/
assert.equal(util.inspect(23), '23')
assert.equal(util.inspect(true), 'true')
assert.equal(util.inspect(false), 'false')
assert.equal(util.inspect(null), 'null')
assert.equal(util.inspect(undefined), 'undefined')
assert.equal(util.inspect([1, 2, 3]), '[1,2,3]')
assert.equal(util.inspect(new Date(1000)), '"1970-01-01T00:00:01.000Z"')
assert.equal(util.inspect('abc'), '"abc"')
assert.equal(util.inspect({a: 'c', b: [1, 2], c: {d: 'e', f: true}}), '{"a":"c","b":[1,2],"c":{"d":"e","f":true}}')
assert.equal(util.inspect(new Set), 'Set {}')
assert.equal(util.inspect(new Set([1])), 'Set {1}')
assert.equal(util.inspect(new Set([1, 2])), 'Set {1, 2}')
assert.equal(util.inspect(new Map), 'Map {}')
assert.equal(util.inspect(new Map().set(1, 2).set(3, 4)), 'Map {1 => 2, 3 => 4}')
class A {
	constructor() { this.one = '1' }
}
assert.equal(util.inspect(new A), 'A {"one":"1"}')
let B = function() { //eslint-disable-line func-style
	this.two = '2'
}
assert.equal(util.inspect(new B), '{"two":"2"}')