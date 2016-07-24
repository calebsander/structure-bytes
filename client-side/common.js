const assert = require('/lib/assert.js');
assert.instanceOf(window.Map, Function);
assert.instanceOf(window.Set, Function);
assert.instanceOf(window.ArrayBuffer, Function);
assert.instanceOf(window.Uint8Array, Function);
assert.instanceOf(window.Symbol, Function);
require('/client-side/binary-ajax.js');
if (window.sb === undefined) window.sb = require('/structure-types.js');
else if (!(window.sb instanceof Object)) throw new Error('window.sb is already defined');