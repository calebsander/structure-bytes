import AbstractType from './abstract'
/**
 * A type that is not a [[PointerType]].
 * Used internally to disallow creating double pointers.
 * @private
 */
export default abstract class AbsoluteType<VALUE, READ_VALUE extends VALUE = VALUE> extends AbstractType<VALUE, READ_VALUE> {}