/*eslint-disable no-undef*/
assert.throws(() => r.type(Buffer.from([t.BooleanTupleType._value, 0, 0, 1])));
assert.throws(() => r.value({buffer: Buffer.from([]), type: new t.Type}));