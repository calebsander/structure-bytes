import {inspect} from './util-inspect'

//A number of useful assertion functions
//Used in tests and for validations in production
function instanceOf(instance: any, constructors: Function | Function[]): void {
	if (!(constructors instanceof Array)) constructors = [constructors]
	let constructorMatched = false
	for (const constructor of constructors) {
		if (
			instance instanceof constructor ||
			(!(instance === undefined || instance === null) && instance.constructor === constructor) //necessary for primitives
		) {
			constructorMatched = true
			return
		}
	}
	if (!constructorMatched) {
		throw new TypeError(
			inspect(instance) +
			' is not an instance of ' +
			constructors
				.map(({name}) => name)
				.join(' or ')
		)
	}
}
function integer(instance: any): void {
	instanceOf(instance, Number)
	if (!Number.isSafeInteger(instance)) {
		throw new RangeError(inspect(instance) + ' is not an integer')
	}
}
function between(lower: number, value: number, upper: number, message?: string): void {
	if (value < lower || value >= upper) {
		const outOfBoundsMessage =
			inspect(value) +
			' is not in [' +
			String(lower) +
			',' +
			String(upper) +
			')'
		if (message) throw new RangeError(message + ' (' + outOfBoundsMessage + ')')
		else throw new RangeError(outOfBoundsMessage)
	}
}
function byteUnsignedInteger(value: any): void {
	integer(value)
	between(0, value, 256)
}
function fail(message: string): never {
	throw new Error(message)
}
//Assert that a condition is met if not, throw an error with the specified message
function assert(condition: boolean, message?: string): void {
	if (!condition) fail(message || 'Assertion failed')
}
function throws(block: () => void, message?: string) {
	let success = true
	try {
		block()
		success = false
	}
	catch (e) {
		if (message) errorMessage(e, message)
	}
	assert(success, message ? 'Was expecting error: ' + message : 'Should throw an error')
}
function equal(actual: any, expected: any): void {
	const error = () => //lazily computed
		new RangeError('Expected ' + inspect(expected) + ' but got ' + inspect(actual))
	if (expected) {
		let matchedSpecialCase = true
		switch (expected.constructor) {
			case Object: {
				if (!(actual && actual.constructor === Object)) throw error()
				for (const key in expected) { //actual is allowed to have fields that are not in expected
					/*istanbul ignore else*/
					if ({}.hasOwnProperty.call(expected, key)) {
						try { equal(actual[key], expected[key]) }
						catch (e) { throw error() }
					}
				}
				break
			}
			case Array: {
				if (!(actual && actual.constructor === Array)) throw error()
				try { equal(actual.length, expected.length) }
				catch (e) { throw error() }
				for (let i = 0; i < expected.length; i++) {
					try { equal(actual[i], expected[i]) }
					catch (e) { throw error() }
				}
				break
			}
			case Map: {
				if (!(actual && actual.constructor === Map)) throw error()
				try { equal(actual.size, expected.size) }
				catch (e) { throw error() }
				const expectedIterator = expected.entries()
				const actualIterator = actual.entries()
				let entry
				while (!(entry = expectedIterator.next()).done) {
					try { equal(entry.value, actualIterator.next().value) }
					catch (e) { throw error() }
				}
				break
			}
			case Set: {
				if (!(actual && actual.constructor === Set)) throw error()
				try { equal(actual.size, expected.size) }
				catch (e) { throw error() }
				const expectedIterator = expected.values()
				const actualIterator = actual.values()
				let entry
				while (!(entry = expectedIterator.next()).done) {
					try { equal(entry.value, actualIterator.next().value) }
					catch (e) { throw error() }
				}
				break
			}
			case ArrayBuffer: {
				if (!(actual && actual.constructor === ArrayBuffer)) throw error()
				try { equal(actual.byteLength, expected.byteLength) }
				catch (e) { throw error() }
				const castActual = new Uint8Array(actual)
				const castExpected = new Uint8Array(expected)
				try {
					for (let i = 0; i < castExpected.length; i++) equal(castActual[i], castExpected[i])
				}
				catch (e) { throw error() }
				break
			}
			case Function: {
				if (!(actual && actual.constructor === Function)) throw error()
				try { equal(actual.name, expected.name) }
				catch (e) { throw error() }
				break
			}
			default: {
				matchedSpecialCase = false
			}
		}
		if (matchedSpecialCase) return
	}
	if (!(expected === undefined || expected === null) && expected.equals instanceof Function) { //if expected has an equals function, use it
		let equals: boolean
		try { equals = expected.equals(actual) }
		catch (e) { throw new Error('equals() is not implemented for ' + inspect(expected)) }
		if (!equals) throw error()
	}
	else { //use primitive equality if nothing else matches
		if (expected !== actual) throw error()
	}
}
function errorMessage(err: Error | null, message: string): void {
	instanceOf(message, String)
	assert(
		err !== null && err.message.startsWith(message),
		'Message "' + (err ? err.message : 'No error thrown') + '" does not start with "' + message + '"'
	)
}
//tslint:disable-next-line:prefer-object-spread
export default Object.assign(assert, {
	//Assert that the instance is an instance of the constructor, or at least one of the constructors, or a subclass
	instanceOf,
	//Assert that a number is an integer (within the +/-2^53 that can be represented precisely in a double)
	integer,
	//Assert that a number is between the specified values, with an optional message
	between,
	//Assert that a number fits in an unsigned byte
	byteUnsignedInteger,
	//Throw an error
	fail,
	//Assert that the execution of a function throws an error, and that the error message matches the specified one
	throws,
	//Assert that two values are "equal"
	//What this means depends a lot on the type of the expected value
	equal,
	//Assert that an error's message begins with the specified text
	errorMessage
})