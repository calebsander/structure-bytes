import AbsoluteType from './absolute';
/**
 * A type storing an unsigned integer
 * @private
 */
export default abstract class UnsignedType<VALUE, READ_VALUE extends VALUE = VALUE> extends AbsoluteType<VALUE, READ_VALUE> {
}
