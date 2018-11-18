import {strict as assert} from 'assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.PointerType(new t.LongType)
	assert.deepEqual(new Uint8Array(type.toBuffer()), bufferFrom([0x70, 0x04]))
	assert(type.equals(r.type(type.toBuffer())))
}