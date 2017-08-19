export interface Newable {
    new (): object;
}
export declare type Constructor = Function & Newable;
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
export declare function get(constructorName: string): Constructor;
