import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	assert.equal(new t.ByteType().getSignature(), 'AA0=S/USLzRFVMU73i67jNK349FgCtYxw4Wl18ziPHeFRZo=')
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
	assert.equal(type.getHash(), '4yDVdolj5f0dBz30x5khFhonpBuHWEPWHic3i2yL7Mk=')
	assert.equal(type.getSignature(), 'AA0=4yDVdolj5f0dBz30x5khFhonpBuHWEPWHic3i2yL7Mk=')
}