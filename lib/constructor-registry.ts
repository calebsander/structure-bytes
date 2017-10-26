/**
 * A value that acts as a constructor
 */
export interface Newable {
	new(): object
}
/**
 * A function that acts as a constructor
 */
export type Constructor = Function & Newable

const registeredConstructors = new Map<string, Constructor>()

/**
 * Gets a constructor function with the specified name.
 * Multiple invocations of this function with
 * the same name produce the same function.
 * @param constructorName The name of the resulting constructor
 * @return A function that can be used as a constructor and has the desired name
 */
export function get(constructorName: string): Constructor {
	let constructor = registeredConstructors.get(constructorName) //ensure same name always maps to same constructor
	if (!constructor) {
		//Create a new function with the correct name
		constructor = {[constructorName]: class {}}[constructorName]
		registeredConstructors.set(constructorName, constructor)
	}
	return constructor
}