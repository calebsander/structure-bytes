import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	assert.equal(new t.ByteType().getSignature(), 'AAw=S/USLzRFVMU73i67jNK349FgCtYxw4Wl18ziPHeFRZo=')
	const type = new t.StructType({
		bcd: new t.PointerType(
			new t.OptionalType(
				new t.SetType(
					new t.MapType(
						new t.UnsignedIntType,
						new t.ArrayType(
							new t.TupleType({
								type: new t.BooleanArrayType,
								length: 5
							})
						)
					)
				)
			)
		)
	})
	assert.equal(type.getHash(), 'YwJi4ZvHdopqQNW0lf2i8zQ37DEDMWmT9gFoqInimHw=')
	assert.equal(type.getSignature(), 'AAw=YwJi4ZvHdopqQNW0lf2i8zQ37DEDMWmT9gFoqInimHw=')
}