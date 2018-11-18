import * as constructorRegistry from '../../dist/lib/constructor-registry'
import {assert} from '../test-common'

export = () => {
	const AFirst = constructorRegistry.get('A')
	const ASecond = constructorRegistry.get('A')
	assert(AFirst === ASecond)
	assert.equal(AFirst.name, 'A')
	const B = constructorRegistry.get('B')
	assert(B !== AFirst)
	assert.equal(B.name, 'B')
}