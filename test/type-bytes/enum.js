let type = new t.EnumType({
	type: new t.StringType(),
	values: [
		'ABC',
		'DEF',
		'GHI'
	]
});
assert.equal(type.toBuffer(), Buffer.from([0x55, 0x41, 3, 0x41, 0x42, 0x43, 0, 0x44, 0x45, 0x46, 0, 0x47, 0x48, 0x49, 0]));