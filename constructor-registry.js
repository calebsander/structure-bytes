//For use with browserify
if (__dirname === '/') __dirname = ''

const registeredConstructors = new Map
module.exports = {
	/** @function
	 * @name get
	 * @desc Gets a constructor function
	 * with the specified name. Multiple
	 * invocations of this function with
	 * the same name produce the same function.
	 * @param {Type} constructorName The name of the constructor
	 * @return {constructor} A function that can be used
	 * as a constructor and has the desired name
	 * @private
	*/
	get(constructorName) {
		const constructor = registeredConstructors.get(constructorName)
		if (constructor) return constructor //ensure same name always maps to same constructor
		else {
			//Create a new function with the correct name
			const newConstructor = {[constructorName]: function() {}}[constructorName] //eslint-disable-line object-shorthand
			registeredConstructors.set(constructorName, newConstructor)
			return newConstructor
		}
	}
}