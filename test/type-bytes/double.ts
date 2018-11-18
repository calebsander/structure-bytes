import {strict as assert} from 'assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.DoubleType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x21]))
	assert(new t.DoubleType().equals(r.type(buffer)))
}