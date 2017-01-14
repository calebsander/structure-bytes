const util = require('util')

//A number of useful assertion functions
//Used in tests and for validations in production
module.exports = class assert {
	//Assert that the instance is an instance of the constructor, or at least one of the constructors, or a subclass
	static instanceOf(instance, constructors) {
		if (!(constructors instanceof Array)) constructors = [constructors]
		let constructorMatched = false
		for (const constructor of constructors) {
			if (
				instance instanceof constructor ||
				(!(instance === undefined || instance === null) && instance.constructor === constructor) //necessary for primitives
			) {
				constructorMatched = true
				break
			}
		}
		if (!constructorMatched) {
			throw new TypeError(
				util.inspect(instance) +
				' is not an instance of ' +
				constructors
					.map(constructor => constructor.name)
						.join(' or ')
			)
		}
	}
	//Assert that a number is an integer (within the +/-2^53 that can be represented precisely in a double)
	static integer(instance) {
		assert.instanceOf(instance, Number)
		if (!Number.isSafeInteger(instance)) throw new RangeError(util.inspect(instance) + ' is not an integer')
	}
	//Assert that a number is between the specified values, with an optional message
	static between(lower, value, upper, message) {
		if (value < lower || value >= upper) {
			const errorMessage = util.inspect(value) + ' is not in [' + util.inspect(lower) + ',' + util.inspect(upper) + ')'
			if (message === undefined) throw new RangeError(errorMessage)
			else throw new RangeError(message + ' (' + errorMessage + ')')
		}
	}
	//Assert that a number fits in an unsigned byte
	static byteUnsignedInteger(value) {
		assert.integer(value)
		assert.between(0, value, 256)
	}
	//Throw an error
	static fail(message) {
		throw new Error(message)
	}
	//Assert that a condition is met if not, throw an error with the specified message
	static assert(condition, message) { //eslint-disable-line no-unreachable
		if (!condition) assert.fail(message)
	}
	//Assert that the execution of a function throws an error, and that the error message matches the specified one
	static throws(block, message) {
		let success = true
		try {
			block()
			success = false
		}
		catch (e) {
			if (message !== undefined) assert.message(e, message)
		}
		assert.assert(success, 'Should throw an error')
	}
	//Assert that two values are "equal"
	//What this means depends a lot on the type of the expected value
	static equal(actual, expected) {
		const error = new RangeError('Expected ' + util.inspect(expected) + ' but got ' + util.inspect(actual))
		if (expected) {
			let matchedSpecialCase = true
			switch (expected.constructor) {
				case Object: {
					if (!(actual && actual.constructor === Object)) throw error
					for (const key in expected) { //actual is allowed to have fields that are not in expected
						if ({}.hasOwnProperty.call(expected, key)) {
							try { assert.equal(actual[key], expected[key]) }
							catch (e) { throw error }
						}
					}
					break
				}
				case Array: {
					if (!(actual && actual.constructor === Array)) throw error
					try { assert.equal(actual.length, expected.length) }
					catch (e) { throw error }
					for (let i = 0; i < expected.length; i++) {
						try { assert.equal(actual[i], expected[i]) }
						catch (e) { throw error }
					}
					break
				}
				case Map: {
					if (!(actual && actual.constructor === Map)) throw error
					try { assert.equal(actual.size, expected.size) }
					catch (e) { throw error }
					const expectedIterator = expected.entries()
					const actualIterator = actual.entries()
					let entry
					while (!(entry = expectedIterator.next()).done) {
						try { assert.equal(entry.value, actualIterator.next().value) }
						catch (e) { throw error }
					}
					break
				}
				case Set: {
					if (!(actual && actual.constructor === Set)) throw error
					try { assert.equal(actual.size, expected.size) }
					catch (e) { throw error }
					const expectedIterator = expected.values()
					const actualIterator = actual.values()
					let entry
					while (!(entry = expectedIterator.next()).done) {
						try { assert.equal(entry.value, actualIterator.next().value) }
						catch (e) { throw error }
					}
					break
				}
				case ArrayBuffer: {
					if (!(actual && actual.constructor === ArrayBuffer)) throw error
					try { assert.equal(actual.byteLength, expected.byteLength) }
					catch (e) { throw error }
					actual = new Uint8Array(actual)
					expected = new Uint8Array(expected)
					try {
						for (let i = 0; i < expected.length; i++) assert.equal(actual[i], expected[i])
					}
					catch (e) { throw error }
					break
				}
				case Function: {
					if (!(actual && actual.constructor === Function)) throw error
					try { assert.equal(actual.name, expected.name) }
					catch (e) { throw error }
					break
				}
				default: {
					matchedSpecialCase = false
				}
			}
			if (matchedSpecialCase) return
		}
		if (!(expected === undefined || expected === null) && expected.equals instanceof Function) { //if expected has an equals function, use it
			let equals
			try { equals = expected.equals(actual) }
			catch (e) { throw new Error('equals() is not implemented for ' + util.inspect(expected)) }
			if (!equals) throw error
		}
		else { //use primitive equality if nothing else matches
			if (expected !== actual) throw error
		}
	}
	//Assert that an error's message begins with the specified text
	static message(err, message) {
		assert.instanceOf(message, String)
		assert.assert(
			err && err.message.startsWith(message),
			'Message "' + (err ? err.message : 'No error thrown') + '" does not start with "' + message + '"'
		)
	}
}