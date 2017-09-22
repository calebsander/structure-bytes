import assert from '../../dist/lib/assert'
import * as rec from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	interface GraphNode {
		links: Set<GraphNode>
		value: number
	}
	rec.registerType({
		type: new t.StructType<GraphNode>({
			links: new t.SetType(
				new t.RecursiveType<GraphNode>('graph-node2') //different name to avoid collisions with type-bytes test
			),
			value: new t.UnsignedIntType
		}),
		name: 'graph-node2'
	})
	const graphType = new t.SetType(
		new t.RecursiveType<GraphNode>('graph-node2')
	)
	const node1First: GraphNode = {value: 1, links: new Set<GraphNode>()}
	const node2: GraphNode = {value: 2, links: new Set<GraphNode>()}
	const node3: GraphNode = {value: 3, links: new Set<GraphNode>()}
	const node1Second: GraphNode = {value: 1, links: new Set<GraphNode>()}
	node1First.links.add(node2).add(node3)
	node2.links.add(node1First).add(node3).add(node1Second)
	node3.links.add(node1First).add(node2)
	node1Second.links.add(node2)
	const graph = new Set([node1First, node2, node3, node1Second])
	const buffer = graphType.valueBuffer(graph)
	assert.equal(buffer, bufferFrom([
		4,
			0xff, 2, //node1First
				0xff, 3, //node2
					0x00, 4, //node1First
					0xff, 2, //node3
						0x00, 8, //node1First
						0x00, 8, //node2
						0, 0, 0, 3,
					0xff, 1, //node1Second
						0x00, 16, //node2
						0, 0, 0, 1,
					0, 0, 0, 2,
				0x00, 22, //node3
				0, 0, 0, 1,
			0x00, 32, //node2
			0x00, 30, //node3
			0x00, 22 //node1Second
	]))
	const readGraph = graphType.readValue(buffer)
	const VALUES = [1, 2, 3, 1]
	for (const g of [graph, readGraph]) {
		let i = 0
		for (const node of g) {
			assert.equal(node.value, VALUES[i])
			i++
		}
		const nodes = Array.from(g)
		const nodeLinks = nodes.map(node => Array.from(node.links))
		assert.equal(nodeLinks.map(links => links.length), [2, 3, 2, 1])
		assert(nodes[0] === nodeLinks[1][0]) //node1First
		assert(nodes[0] === nodeLinks[2][0]) //node1First
		assert(nodes[1] === nodeLinks[0][0]) //node2
		assert(nodes[1] === nodeLinks[2][1]) //node2
		assert(nodes[1] === nodeLinks[3][0]) //node2
		assert(nodes[2] === nodeLinks[0][1]) //node3
		assert(nodes[2] === nodeLinks[1][1]) //node3
		assert(nodes[3] === nodeLinks[1][2]) //node1Second
	}

	interface SelfReference {
		self: SelfReference
	}
	const selfReferenceType = new t.RecursiveType<SelfReference>('self-reference')
	rec.registerType({
		type: new t.StructType({
			self: selfReferenceType
		}),
		name: 'self-reference'
	})
	const selfReference: SelfReference = {} as SelfReference
	selfReference.self = selfReference
	assert.equal(selfReferenceType.valueBuffer(selfReference), bufferFrom([
		0xff,
			0x00, 1
	]))
}