let ended = 0;
new t.ByteType().getSignature((signature) => {
	assert.assert(signature === 'AAI=S/USLzRFVMU73i67jNK349FgCtYxw4Wl18ziPHeFRZo=');
	ended++;
});
let waitForFinish = setInterval(() => {
	if (ended === 2) clearInterval(waitForFinish);
}, 10);
new t.StructType({
	'bcd': new t.PointerType(
		new t.OptionalType(
			new t.SetType(
				new t.MapType(
					new t.UnsignedIntType(),
					new t.ArrayType(
						new t.TupleType(
							new t.BooleanArrayType(), 5
						)
					)
				)
			)
		)
	)
}).getSignature((signature) => {
	assert.assert(signature === 'AAI=URZ81sn26XuBj9ckIE65/aNkAylI8xHXWB+8V34RJBs=');
	ended++;
});