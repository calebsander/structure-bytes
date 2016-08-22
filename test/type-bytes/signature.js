/*eslint-disable no-undef*/
assert.equal(new t.ByteType().getSignature(), 'AAk=S/USLzRFVMU73i67jNK349FgCtYxw4Wl18ziPHeFRZo=');
let type = new t.StructType({
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
});
assert.equal(type.getSignature(), 'AAk=URZ81sn26XuBj9ckIE65/aNkAylI8xHXWB+8V34RJBs=');