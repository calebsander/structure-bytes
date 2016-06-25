let set = new t.SetType(
  new t.StructType([
    {name: 'long', type: new t.LongType()},
    {name: 'str', type: new t.StringType()}
  ])
);
assert.assert(set.toBuffer().equals(Buffer.from([0x53, 0x51, 2, 4, 0x6c, 0x6f, 0x6e, 0x67, 0x04, 3, 0x73, 0x74, 0x72, 0x41])));