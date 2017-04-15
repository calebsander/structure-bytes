/*eslint-env browser*/
const assert = require('../lib/assert')
assert.instanceOf(window.Map, Function)
assert.instanceOf(window.Set, Function)
assert.instanceOf(window.ArrayBuffer, Function)
assert.instanceOf(window.Uint8Array, Function)
assert.instanceOf(window.Symbol, Function)
require('./binary-ajax')
if (!window.sb) {
	window.sb = require('../structure-types')
	const recursiveRegistry = require('../recursive-registry')
	for (const key in recursiveRegistry) {
		if ({}.hasOwnProperty.call(recursiveRegistry, key)) window.sb[key] = recursiveRegistry[key]
	}
}
else if (!(window.sb instanceof Object)) throw new Error('window.sb is already defined')