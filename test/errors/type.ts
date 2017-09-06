import assert from '../../dist/lib/assert'
import * as t from '../../dist/types'
import AbstractType from '../../dist/types/abstract'

export = () => {
	assert.throws(
		() => AbstractType._value,
		'Generic Type has no value byte'
	)
	const type = new (AbstractType as any)
	assert.throws(
		() => type.valueBuffer(23),
		'this.writeValue is not a function'
	)
	for (const typeConstructor of [
		t.ArrayType,
		t.BigIntType,
		t.BigUnsignedIntType,
		t.BooleanArrayType,
		t.BooleanTupleType,
		t.BooleanType,
		t.ByteType,
		t.CharType,
		t.ChoiceType,
		t.DateType,
		t.DayType,
		t.DoubleType,
		t.EnumType,
		t.FlexUnsignedIntType,
		t.FloatType,
		t.IntType,
		t.LongType,
		t.MapType,
		t.NamedChoiceType,
		t.OctetsType,
		t.OptionalType,
		t.PointerType,
		t.RecursiveType,
		t.SetType,
		t.ShortType,
		t.StringType,
		t.StructType,
		t.TimeType,
		t.TupleType,
		t.UnsignedByteType,
		t.UnsignedIntType,
		t.UnsignedLongType,
		t.UnsignedShortType
	] as (typeof AbstractType)[]) {
		assert.throws( //make sure it warns about invalid buffer before invalid value
			() => typeConstructor.prototype.writeValue('abc' as any, Symbol('def')),
			'"abc" is not an instance of GrowableBuffer or AppendableStream'
		)
	}
}