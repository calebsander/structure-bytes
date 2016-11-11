//For use with browserify
if (__dirname === '/') __dirname = ''

const registeredConstructors = new Map
module.exports = {
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