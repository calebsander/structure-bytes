export interface Newable {
	new(): object
}
export type Constructor = Function & Newable

const registeredConstructors = new Map<string, Constructor>()
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
export function get(constructorName: string): Constructor {
	const constructor = registeredConstructors.get(constructorName)
	if (constructor) return constructor //ensure same name always maps to same constructor
	else {
		//Create a new function with the correct name
		const newConstructor = {[constructorName]: class {}}[constructorName]
		registeredConstructors.set(constructorName, newConstructor)
		return newConstructor
	}
}