import assert from '../../dist/lib/assert'
import * as constructorRegistry from '../../dist/lib/constructor-registry'

export = () => {
	const AFirst = constructorRegistry.get('A')
	const ASecond = constructorRegistry.get('A')
	assert(AFirst === ASecond)
	assert.equal(AFirst.name, 'A')
	const B = constructorRegistry.get('B')
	assert(B !== AFirst)
	assert.equal(B.name, 'B')
}