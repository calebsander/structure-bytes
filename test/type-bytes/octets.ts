import {strict as assert} from 'assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.OctetsType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x42]))
	assert(new t.OctetsType().equals(r.type(buffer)))
}