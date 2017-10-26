import * as crypto from 'crypto'
import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as rec from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	interface GraphNode {
		links: Set<GraphNode>
		value: number
	}
	const nodeType = new t.RecursiveType<GraphNode>('graph-node')
	rec.registerType({
		type: new t.StructType<GraphNode>({
			links: new t.SetType(nodeType),
			value: new t.UnsignedIntType
		}),
		name: 'graph-node'
	})
	const graphType = new t.SetType(nodeType)
	const GRAPH_BUFFER = bufferFrom([0x53, 0x57, 0, 0x51, 2, 5, 0x6c, 0x69, 0x6e, 0x6b, 0x73, 0x53, 0x57, 0, 5, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x13])
	assert.equal(graphType.toBuffer(), GRAPH_BUFFER)
	const readGraphType = r.type(GRAPH_BUFFER) as typeof graphType
	const graphNodeName = (readGraphType.type as typeof nodeType).name
	assert.equal(readGraphType, new t.SetType(
		new t.RecursiveType<GraphNode>(graphNodeName)
	))
	assert.equal(rec.getType(graphNodeName), new t.StructType({
		links: new t.SetType(
			new t.RecursiveType<GraphNode>(graphNodeName)
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
	assert.equal(type.toBuffer(), bufferFrom([0x52, 0x57, 0, 0x52, 0x57, 0])) //the important piece is that the child array type declaration doesn't point to the root one
	//Test multiple recursive types in same buffer
	interface BinaryTree {
		left: BinaryTree | null
		value: GraphNode
		right: BinaryTree | null
	}
	const binaryTreeType = new t.RecursiveType<BinaryTree>('tree-node')
	rec.registerType({
		type: new t.StructType<BinaryTree>({
			left: binaryTreeType,
			value: nodeType,
			right: binaryTreeType
		}),
		name: 'tree-node'
	})
	assert.equal(binaryTreeType.toBuffer(), bufferFrom([0x57, 0, 0x51, 3, 4, 0x6c, 0x65, 0x66, 0x74, 0x57, 0, 5, 0x72, 0x69, 0x67, 0x68, 0x74, 0x57, 0, 5, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x57, 1, 0x51, 2, 5, 0x6c, 0x69, 0x6e, 0x6b, 0x73, 0x53, 0x57, 1, 5, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x13]))
	const readTreeType = r.type(binaryTreeType.toBuffer()) as typeof binaryTreeType
	assert.instanceOf(readTreeType, t.RecursiveType)
	const readTreeName = readTreeType.name
	const valueField = (rec.getType(readTreeName) as t.StructType<BinaryTree>).fields.find(field => field.name === 'value')
	if (valueField === undefined) throw new Error('No field with name "value"')
	const readNodeName = (valueField.type as typeof nodeType).name
	assert.equal(rec.getType(readTreeName), new t.StructType({
		left: new t.RecursiveType<BinaryTree>(readTreeName),
		value: new t.RecursiveType<GraphNode>(readNodeName),
		right: new t.RecursiveType<BinaryTree>(readTreeName)
	}))

	assert.throws(() => new (t.RecursiveType as any), 'undefined is not an instance of String')
	assert.throws(() => new t.RecursiveType(23 as any), '23 is not an instance of String')
	assert.throws(
		() => new t.RecursiveType('abc').toBuffer(),
		'"abc" is not a registered type'
	)
	assert.throws(() => r.type(bufferFrom([0x57])), 'Buffer is not long enough')
	assert.throws(() => r.type(bufferFrom([0x57, 0])), 'Buffer is not long enough')
	assert.throws(() => rec.registerType(undefined as any), "Cannot destructure property `type` of 'undefined' or 'null'.")
	assert.throws(
		() => rec.registerType({name: 'some-type'} as any),
		'undefined is not an instance of ArrayType or MapType or SetType or StructType or TupleType'
	)
	assert.throws(
		() => rec.registerType({
			name: 'another-type',
			type: new t.OptionalType(
				new t.StructType({
					a: new t.StringType,
					b: new t.StringType
				})
			) as any
		}),
		'OptionalType {type: StructType {fields: [{name: "a", type: StringType {}, nameBuffer: [0x61]}, {name: "b", type: StringType {}, nameBuffer: [0x62]}]}} is not an instance of ArrayType or MapType or SetType or StructType or TupleType'
	)
	assert.throws(
		() => rec.registerType({name: 23 as any, type: new t.StructType({})}),
		'23 is not an instance of String'
	)
	assert.throws(
		() => rec.registerType({name: 'some-type', type: 23 as any}),
		'23 is not an instance of ArrayType or MapType or SetType or StructType or TupleType'
	)
	assert.throws(
		() => rec.registerType({name: 'tree-node', type: new t.StructType({})}),
		'"tree-node" is already a registered type'
	)
	assert.throws(
		() => new t.RecursiveType('abc').toBuffer(),
		'"abc" is not a registered type'
	)

	const randomString = crypto.randomBytes(1000).toString('binary')
	assert(!rec.isRegistered(randomString))
	rec.registerType({
		type: new t.StructType({}),
		name: randomString
	})
	assert(rec.isRegistered(randomString))
}