import * as util from '../../dist/lib/util-inspect'
import {assert} from '../test-common'

export = () => {
	assert.equal(util.inspect(23), '23')
	assert.equal(util.inspect(true), 'true')
	assert.equal(util.inspect(false), 'false')
	assert.equal(util.inspect(null), 'null')
	assert.equal(util.inspect(undefined), 'undefined')
	assert.equal(util.inspect([1, 2, 3]), '[1, 2, 3]')
	assert.equal(util.inspect(new Date(1000)), '"1970-01-01T00:00:01.000Z"')
	assert.equal(util.inspect('abc'), '"abc"')
	assert.equal(
		util.inspect({a: 'c', b: [1, 2], c: {d: 'e', f: true}}),
		'{a: "c", b: [1, 2], c: {d: "e", f: true}}'
	)
	assert.equal(util.inspect(new Set), 'Set {}')
	assert.equal(util.inspect(new Set([1])), 'Set {1}')
	assert.equal(util.inspect(new Set([1, 2])), 'Set {1, 2}')
	assert.equal(util.inspect(new Map), 'Map {}')
	assert.equal(util.inspect(new Map().set(1, 2).set(3, 4)), 'Map {1 => 2, 3 => 4}')
	class A {
		one: string
		constructor() { this.one = '1' }
	}
	assert.equal(util.inspect(new A), 'A {one: "1"}')
	const [B] = [class { //without array destructuring, B.name is defined
		one: number
		constructor() {
			this.one = 2
		}
	}]
	assert.equal(util.inspect(new B), '{one: 2}')
	assert.equal(util.inspect(Buffer.from([0x01, 0x10])), '<Buffer 01 10>')
	const circularArray: any[] = []
	const arr = [2, circularArray]
	circularArray.push(circularArray, 1, arr, arr)
	assert.equal(util.inspect(circularArray), '[[Circular], 1, [2, [Circular]], [2, [Circular]]]')
	assert.equal(util.inspect(circularArray), '[[Circular], 1, [2, [Circular]], [2, [Circular]]]') //ensure seen set is not persistent
	const circularSet = new Set
	const circularSet2 = new Set([circularSet])
	circularSet2
		.add(circularSet2)
		.add(new Set([circularSet2]))
	circularSet
		.add('abc')
		.add(circularSet)
		.add(circularSet2)
	assert.equal(util.inspect(circularSet), 'Set {"abc", [Circular], Set {[Circular], [Circular], Set {[Circular]}}}')
	const circularMap = new Map
	const obj = {}
	circularMap
		.set(1, obj)
		.set(obj, {obj})
		.set(3, circularMap)
		.set(circularMap, 4)
	assert.equal(util.inspect(circularMap), 'Map {1 => {}, {} => {obj: {}}, 3 => [Circular], [Circular] => 4}')
	const circularObj: any = {}
	circularObj.abc = circularObj
	circularObj.def = [1, circularObj, 2]
	circularObj.def2 = circularObj.def
	circularObj.ghi = new Set([circularObj])
	assert.equal(util.inspect(circularObj), '{abc: [Circular], def: [1, [Circular], 2], def2: [1, [Circular], 2], ghi: Set {[Circular]}}')
	const circularInstance: any = new (class Abc {})()
	circularInstance.abc = circularInstance
	circularInstance.def = [1, circularInstance, 2]
	circularInstance.def2 = circularInstance.def
	circularInstance.ghi = new Set([circularInstance])
	assert.equal(util.inspect(circularInstance), 'Abc {abc: [Circular], def: [1, [Circular], 2], def2: [1, [Circular], 2], ghi: Set {[Circular]}}')
}