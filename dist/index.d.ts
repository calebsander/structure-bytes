/**
 * `structure-bytes` exports the following named members:
 *
 * - **From** `io`
 *   - [[writeType]]
 *   - [[writeValue]]
 *   - [[writeTypeAndValue]]
 *   - [[readType]]
 *   - [[readValue]]
 *   - [[readTypeAndValue]]
 *   - [[httpRespond]]
 * - **From** `read`
 *   - [[readTypeBuffer]] as `r.type`
 *   - [[readValueBuffer]] as `r.value`
 * - **From** `recursive-registry`
 *   - [[registerType]]
 *   - [[getType]]
 *   - [[isRegistered]]
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
export * from './io';
import * as read from './read';
export declare const r: typeof read;
export * from './recursive-registry';
export * from './types';
