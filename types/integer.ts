import AbsoluteType from './absolute'

/**
 * A type storing an signed integer
 * @private
 */
export default abstract class IntegerType<VALUE, READ_VALUE extends VALUE = VALUE> extends AbsoluteType<VALUE, READ_VALUE> {}