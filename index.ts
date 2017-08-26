/**
 * `structure-bytes` exports the following named members:
 *
 * - **From** `io`
 *   - [[writeType]]
 *   - [writeValue](_io_.html#writevalue)
 *   - [[writeTypeAndValue]]
 *   - [readType](_io_.html#readtype)
 *   - [[readValue]]
 *   - [[readTypeAndValue]]
 *   - [[httpRespond]]
 * - **From** `read`
 *   - [type](_read_.html#type) as `r.type`
 *   - [value](_read_.html#value) as `r.value`
 * - **From** `recursive-registry`
 *   - [registerType](_recursive_registry_.html#registertype)
 *   - [getType](_recursive_registry_.html#gettype)
 *   - [isRegistered](_recursive_registry_.html#isregistered)
 * - **From** `types`
 *   - [[Type]]
 *   - Signed integer types
 *     - [[ByteType]]
 *     - [[ShortType]]
 *     - [[IntType]]
 *     - [[LongType]]
 *     - [[BigIntType]]
 *   - Unsigned integer types
 *     - [[UnsignedByteType]]
 *     - [[UnsignedShortType]]
 *     - [[UnsignedIntType]]
 *     - [[UnsignedLongType]]
 *     - [[BigUnsignedIntType]]
 *     - [[FlexUnsignedIntType]]
 *   - Chrono types
 *     - [[DateType]]
 *     - [[DayType]]
 *     - [[TimeType]]
 *   - Floating-point types
 *     - [[FloatType]]
 *     - [[DoubleType]]
 *   - Boolean types
 *     - [[BooleanType]]
 *     - [[BooleanTupleType]]
 *     - [[BooleanArrayType]]
 *   - String and buffer types
 *     - [[CharType]]
 *     - [[StringType]]
 *     - [[OctetsType]]
 *   - Non-primitive types
 *     - [[TupleType]]
 *     - [[StructType]]
 *     - [[ArrayType]]
 *     - [[SetType]]
 *     - [[MapType]]
 *     - [[EnumType]]
 *     - [[ChoiceType]]
 *     - [[NamedChoiceType]]
 *     - [[RecursiveType]]
 *   - Modifier types
 *     - [[OptionalType]]
 *     - [[PointerType]]
 */

/**
 */
export * from './io'
import * as read from './read'
export const r = read
export * from './recursive-registry'
export * from './types'