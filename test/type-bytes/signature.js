/*eslint-disable no-undef*/
assert.equal(new t.ByteType().getSignature(), 'AAo=S/USLzRFVMU73i67jNK349FgCtYxw4Wl18ziPHeFRZo=')
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
assert.equal(type.getSignature(), 'AAo=YwJi4ZvHdopqQNW0lf2i8zQ37DEDMWmT9gFoqInimHw=')