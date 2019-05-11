import {inspect} from '../../dist/lib/util-inspect'
import * as rec from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

type Field = {a: Fields} | {b: boolean}
interface Fields {
	fields: Field[]
}

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
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([
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
			assert.equal(node.value, VALUES[i++])
		}
		const nodes = [...g]
		const nodeLinks = nodes.map(node => [...node.links])
		assert.deepEqual(nodeLinks.map(links => links.length), [2, 3, 2, 1])
		assert.equal(nodes[0], nodeLinks[1][0]) //node1First
		assert.equal(nodes[0], nodeLinks[2][0]) //node1First
		assert.equal(nodes[1], nodeLinks[0][0]) //node2
		assert.equal(nodes[1], nodeLinks[2][1]) //node2
		assert.equal(nodes[1], nodeLinks[3][0]) //node2
		assert.equal(nodes[2], nodeLinks[0][1]) //node3
		assert.equal(nodes[2], nodeLinks[1][1]) //node3
		assert.equal(nodes[3], nodeLinks[1][2]) //node1Second
	}

	interface SelfReference {
		self: SelfReference
	}
	const selfReferenceType = new t.RecursiveType<SelfReference>('self-reference')
	selfReferenceType.setType(new t.StructType<SelfReference>({
		self: selfReferenceType
	}))
	const selfReference: SelfReference = {} as SelfReference
	selfReference.self = selfReference
	assert.deepEqual(
		new Uint8Array(selfReferenceType.valueBuffer(selfReference)),
		new Uint8Array([
			0xff,
				0x00, 1
		])
	)

	const tupleType = new t.RecursiveType<any[]>('tuple-or-not')
	rec.registerType({
		type: new t.TupleType({
			type: new t.OptionalType(tupleType),
			length: 3
		}),
		name: 'tuple-or-not'
	})
	const tupleA: any[] = []
	const tupleB: any[] = []
	tupleA.push(null, tupleB, tupleA)
	tupleB.push(tupleA, null, null)
	const tupleBuffer = tupleType.valueBuffer(tupleA)
	assert.deepEqual(new Uint8Array(tupleBuffer), new Uint8Array([
		0xff,
			0x00,
			0xff,
				0xff,
					0xff,
						0x00, 5,
					0x00,
					0x00,
			0xff,
				0x00, 10
	]))
	const readTupleA = tupleType.readValue(tupleBuffer)
	assert.equal(readTupleA.length, tupleA.length)
	assert.equal(readTupleA[0], null)
	assert.equal(readTupleA[2], readTupleA)
	const readTupleB = readTupleA[1]
	assert.equal(readTupleB.length, tupleB.length)
	assert.equal(readTupleB[0], readTupleA)
	assert.equal(readTupleB[1], null)
	assert.equal(readTupleB[2], null)

	const arrayType = new t.RecursiveType<any[]>('num-or-array')
	rec.registerType({
		type: new t.ArrayType(
			new t.ChoiceType<any>([
				new t.UnsignedByteType,
				arrayType
			])
		),
		name: 'num-or-array'
	})
	const arr: any[] = [1, 2]
	arr.push(arr, 3, 4, arr, 5)
	const arrBuffer = arrayType.valueBuffer(arr)
	assert.deepEqual(new Uint8Array(arrBuffer), new Uint8Array([
		0xff,
			7,
			0,
				1,
			0,
				2,
			1,
				0x00, 7,
			0,
				3,
			0,
				4,
			1,
				0x00, 14,
			0,
				5
	]))
	const readArr = arrayType.readValue(arrBuffer)
	assert.equal(inspect(readArr), inspect(arr))

	const setType = new t.RecursiveType<Set<any>>('num-or-set')
	rec.registerType({
		type: new t.SetType(
			new t.ChoiceType<any>([
				new t.UnsignedByteType,
				setType
			])
		),
		name: 'num-or-set'
	})
	const set: Set<any> = new Set([1, 2])
	set
		.add(3)
		.add(4)
		.add(set)
		.add(5)
	const setBuffer = setType.valueBuffer(set)
	assert.deepEqual(new Uint8Array(setBuffer), new Uint8Array([
		0xff,
			6,
			0,
				1,
			0,
				2,
			0,
				3,
			0,
				4,
			1,
				0x00, 11,
			0,
				5
	]))
	const readSet = setType.readValue(setBuffer)
	assert.equal(inspect(readSet), inspect(set))

	const mapType = new t.RecursiveType<Map<number, any>>('recursive-map')
	rec.registerType({
		type: new t.MapType(
			new t.FlexUnsignedIntType,
			mapType
		),
		name: 'recursive-map'
	})
	const map = new Map<number, any>()
	map.set(10, new Map)
	map.set(50, new Map<number, any>().set(20, map))
	map.set(100, map)
	const mapBuffer = mapType.valueBuffer(map)
	assert.deepEqual(new Uint8Array(mapBuffer), new Uint8Array([
		0xff,
			3,
			10,
				0xff,
					0,
			50,
				0xff,
					1,
					20,
						0x00, 9,
			100,
				0x00, 12
	]))

	{
		const fieldsType = new t.RecursiveType<Fields>('fields')
		rec.registerType({
			type: new t.StructType({
				fields: new t.ArrayType(
					new t.ChoiceType<Field>([
						new t.StructType({a: fieldsType}),
						new t.StructType({b: new t.BooleanType})
					])
				)
			}),
			name: 'fields'
		})
		assert.throws(
			() => fieldsType.valueBuffer({
				fields: [
					{a: null as any, b: true}, //this will try to write null with fieldsType
					{a: null as any, b: 1 as any} //ensure null is not considered already written by fieldsType
				]
			}),
			(err: Error) => err.message === 'No types matched: {a: null, b: 1}'
		)
	}

	assert.throws(
		() => selfReferenceType.readValue(new Uint8Array([0xff, 0x00, 2]).buffer),
		(err: Error) => err.message === 'Cannot find target at 0'
	)
}