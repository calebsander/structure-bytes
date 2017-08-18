import AbstractType from './abstract'
/**
 * A type that is not a {@link PointerType}.
 * Used internally to disallow creating double pointers.
 * @private
*/
export default abstract class AbsoluteType<VALUE> extends AbstractType<VALUE> {}