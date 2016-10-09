const sb = require('structure-bytes')
const GrowableBuffer = require('./lib/growable-buffer.js')

//A binary tree of unsigned bytes
const treeType = new sb.RecursiveType('tree-node')
sb.registerType({
	type: new sb.StructType({
		left: new sb.OptionalType(treeType),
		value: new sb.UnsignedByteType,
		right: new sb.OptionalType(treeType)
	}),
	name: 'tree-node' //name must match name passed to RecursiveType constructor
})

const buffer = new GrowableBuffer
/*
    4
   / \
  2   5
 / \   \
1   3   6
*/
treeType.writeValue(buffer, {
	left: {
		left: {
			left: null,
			value: 1,
			right: null
		},
		value: 2,
		right: {
			left: null,
			value: 3,
			right: null
		}
	},
	value: 4,
	right: {
		left: null,
		value: 5,
		right: {
			left: null,
			value: 6,
			right: null
		}
	}
})
console.log(Buffer.from(buffer.toBuffer()))