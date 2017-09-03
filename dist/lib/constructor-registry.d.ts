/**
 * A value that acts as a constructor
 */
export interface Newable {
    new (): object;
}
/**
 * A function that acts as a constructor
 */
export declare type Constructor = Function & Newable;
/**
 * Gets a constructor function with the specified name.
 * Multiple invocations of this function with
 * the same name produce the same function.
 * @param constructorName The name of the resulting constructor
 * @return A function that can be used as a constructor and has the desired name
 */
export declare function get(constructorName: string): Constructor;
