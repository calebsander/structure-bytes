import AbsoluteType from './absolute'

/**
 * A type storing a [floating-point number]{@linkplain https://en.wikipedia.org/wiki/Floating_point}
 * @private
 */
export default abstract class FloatingPointType extends AbsoluteType<number | string> {}