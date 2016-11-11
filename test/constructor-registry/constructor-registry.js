/*eslint-disable no-undef*/
const AFirst = constructorRegistry.get('A')
const ASecond = constructorRegistry.get('A')
assert.assert(AFirst === ASecond)
assert.equal(AFirst.name, 'A')
const B = constructorRegistry.get('B')
assert.assert(B !== AFirst)
assert.equal(B.name, 'B')