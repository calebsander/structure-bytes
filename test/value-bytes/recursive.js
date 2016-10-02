/*eslint-disable no-undef, indent*/
rec.registerType({
	type: new t.StructType({
		links: new t.SetType(
			new t.RecursiveType('graph-node2') //different name to avoid collisions with type-bytes test
		),
		value: new t.UnsignedIntType
	}),
	name: 'graph-node2'
})
const graphType = new t.SetType(
	new t.RecursiveType('graph-node2')
)
const node1First = {value: 1, links: new Set}
const node2 = {value: 2, links: new Set}
const node3 = {value: 3, links: new Set}
const node1Second = {value: 1, links: new Set}
node1First.links.add(node2).add(node3)
node2.links.add(node1First).add(node3).add(node1Second)
node3.links.add(node1First).add(node2)
node1Second.links.add(node2)
const graph = new Set([node1First, node2, node3, node1Second])
assert.equal(graphType.valueBuffer(graph), bufferFrom([
	0, 0, 0, 4,
		0xff, 0, 0, 0, 2, //node1First
			0xff, 0, 0, 0, 3, //node2
				0x00, 0, 0, 0, 10, //node1First
				0xff, 0, 0, 0, 2, //node3
					0x00, 0, 0, 0, 20, //node1First
					0x00, 0, 0, 0, 20, //node2
					0, 0, 0, 3,
				0xff, 0, 0, 0, 1, //node1Second
					0x00, 0, 0, 0, 34, //node2
					0, 0, 0, 1,
				0, 0, 0, 2,
			0x00, 0, 0, 0, 37, //node3
			0, 0, 0, 1,
		0x00, 0, 0, 0, 56, //node2
		0x00, 0, 0, 0, 51, //node3
		0x00, 0, 0, 0, 37 //node1Second
]))