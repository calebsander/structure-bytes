var type = new sb.ArrayType(
	new sb.StructType({
		name: new sb.StringType,
		id: new sb.UnsignedShortType
	})
);
console.log(type);
sb.upload({
	type,
	value: [
		{name: 'John', id: 2},
		{name: 'Jane', id: 10}
	],
	url: '/uploadtest',
	options: {method: 'POST'}
})
	.then(response => response.text())
	.then(alert);