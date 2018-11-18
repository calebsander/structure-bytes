import {strict as assert} from 'assert'
import {r} from '../../dist'
import * as t from '../../dist'
import AbstractType from '../../dist/types/abstract'
import {bufferFrom} from '../test-common'

export = () => {
	assert.throws(
		() => new t.OctetsType().readValue(bufferFrom([0b10000000]).buffer),
		(err: Error) => err.message === 'Buffer is not long enough'
	)
	assert.throws(
		() => r.type(bufferFrom([t.TupleType._value, t.ByteType._value]).buffer),
		(err: Error) => err.message === 'Buffer is not long enough'
	)
	assert.throws(
		() => new (AbstractType as any)().readValue(new ArrayBuffer(0)),
		(err: Error) => err.message === 'this.consumeValue is not a function'
	)
	assert.throws(
		() => r.type(bufferFrom([0xaa]).buffer),
		(err: Error) => err.message === 'No such type: 0xaa'
	)
}