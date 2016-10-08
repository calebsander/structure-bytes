/*eslint-disable no-undef*/
const nodeType = new t.RecursiveType('graph-node')
rec.registerType({
	type: new t.StructType({
		links: new t.SetType(nodeType),
		value: new t.UnsignedIntType
	}),
	name: 'graph-node'
})
const graphType = new t.SetType(
	new t.RecursiveType('graph-node')
)
const GRAPH_BUFFER = bufferFrom([0x53, 0x57, 0, 0, 0x51, 2, 5, 0x6c, 0x69, 0x6e, 0x6b, 0x73, 0x53, 0x57, 0, 0, 5, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x13])
assert.equal(graphType.toBuffer(), GRAPH_BUFFER)
const readGraphType = r.type(graphType.toBuffer())
const graphNodeName = readGraphType.type.name
assert.equal(readGraphType, new t.SetType(
	new t.RecursiveType(graphNodeName)
))
assert.equal(rec.getType(graphNodeName), new t.StructType({
	links: new t.SetType(
		new t.RecursiveType(graphNodeName)
	),
	value: new t.UnsignedIntType
}))
const reusedGraphType = new t.SetType(nodeType)
assert.equal(reusedGraphType.toBuffer(), GRAPH_BUFFER)
//Ensure that REPEATED_TYPE links don't go outside of recursive type
const type = new t.ArrayType(
	new t.RecursiveType('type')
)
rec.registerType({
	type,
	name: 'type'
})
assert.equal(type.toBuffer(), bufferFrom([0x52, 0x57, 0, 0, 0x52, 0x57, 0, 0])) //the important piece is that the child array type declaration doesn't point to the root one
//Test multiple recursive types in same buffer
const binaryTreeType = new t.RecursiveType('tree-node')
rec.registerType({
	type: new t.StructType({
		left: binaryTreeType,
		value: nodeType,
		right: binaryTreeType
	}),
	name: 'tree-node'
})
assert.equal(binaryTreeType.toBuffer(), bufferFrom([0x57, 0, 0, 0x51, 3, 4, 0x6c, 0x65, 0x66, 0x74, 0x57, 0, 0, 5, 0x72, 0x69, 0x67, 0x68, 0x74, 0x57, 0, 0, 5, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x57, 0, 1, 0x51, 2, 5, 0x6c, 0x69, 0x6e, 0x6b, 0x73, 0x53, 0x57, 0, 1, 5, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x13]))
const readTreeType = r.type(binaryTreeType.toBuffer())
assert.instanceOf(readTreeType, t.RecursiveType)
const readTreeName = readTreeType.name
const readNodeName = rec.getType(readTreeName).fields.find(field => field.name === 'value').type.name
assert.equal(rec.getType(readTreeName), new t.StructType({
	left: new t.RecursiveType(readTreeName),
	value: new t.RecursiveType(readNodeName),
	right: new t.RecursiveType(readTreeName)
}))

assert.throws(() => new t.RecursiveType(), 'undefined is not an instance of String')
assert.throws(() => new t.RecursiveType(23), '23 is not an instance of String')
assert.throws(
	() => new t.RecursiveType('abc').toBuffer(),
	'"abc" is not a registered type'
)
assert.throws(() => r.type(bufferFrom([0x57, 0])), 'Buffer is not long enough')
assert.throws(() => r.type(bufferFrom([0x57, 0, 0])), 'Buffer is not long enough')
assert.throws(() => rec.registerType(), "Cannot match against 'undefined' or 'null'.")
assert.throws(() => rec.registerType({name: 'some-type'}), 'undefined is not an instance of ArrayType or MapType or SetType or StructType or TupleType')
assert.throws(
	() => rec.registerType({name: 'another-type', type: new t.OptionalType(
		new t.StructType({
			a: new t.StringType,
			b: new t.StringType
		})
	)}),
	'OptionalType { type: StructType { fields: [ [Object], [Object] ] } } is not an instance of ArrayType or MapType or SetType or StructType or TupleType'
)
assert.throws(() => rec.registerType({name: 23, type: new t.StructType({})}), '23 is not an instance of String')
assert.throws(() => rec.registerType({name: 'some-type', type: 23}), '23 is not an instance of ArrayType or MapType or SetType or StructType or TupleType')
assert.throws(() => rec.registerType({name: 'tree-node', type: new t.StructType({})}), '"tree-node" is already a registered type')