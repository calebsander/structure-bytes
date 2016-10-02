/*eslint-disable no-undef*/
const nodeType = new t.RecursiveType('graph-node')
rec.registerType({
	type: new t.SetType(nodeType),
	name: 'graph-node'
})
const graphType = new t.SetType(
	new t.RecursiveType('graph-node')
)
assert.equal(graphType.toBuffer(), bufferFrom([0x53, 0x57, 0, 0, 0x53, 0x57, 0, 0]))
const reusedGraphType = new t.SetType(nodeType)
assert.equal(reusedGraphType.toBuffer(), bufferFrom([0x53, 0x57, 0, 0, 0x53, 0xff, 0, 5]))
//Test multiple recursive types in same buffer
const binaryTreeType = rec.registerType({
	type: new t.StructType({
		left: new t.RecursiveType('tree-node'),
		value: nodeType,
		right: new t.RecursiveType('tree-node')
	}),
	name: 'tree-node'
})
assert.equal(binaryTreeType.toBuffer(), bufferFrom([0x51, 3, 4, 0x6c, 0x65, 0x66, 0x74, 0x57, 0, 0, 0xff, 0, 11, 5, 0x72, 0x69, 0x67, 0x68, 0x74, 0x57, 0, 0, 5, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x57, 0, 1, 0x53, 0xff, 0, 5]))

assert.throws(() => new t.RecursiveType(), 'undefined is not an instance of String')
assert.throws(() => new t.RecursiveType(23), '23 is not an instance of String')
assert.throws(
	() => new t.RecursiveType('abc').toBuffer(),
	'"abc" is not a registered type'
)
assert.throws(() => rec.registerType(), "Cannot match against 'undefined' or 'null'.")
assert.throws(() => rec.registerType({name: 'some-type'}), 'undefined is not an instance of Type')
assert.throws(() => rec.registerType({name: 23, type: new t.ByteType}), '23 is not an instance of String')
assert.throws(() => rec.registerType({name: 'some-type', type: 23}), '23 is not an instance of Type')
assert.throws(() => rec.registerType({name: 'tree-node', type: new t.UnsignedIntType}), '"tree-node" is already a registered type')