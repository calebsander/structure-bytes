const t = require(__dirname + '/../structure-types.js');

console.log('STRUCT');
let struct = new t.StructType([
  {name: 'bobbé', type: new t.BooleanType()},
  {name: '', type: new t.IntType()}
]);
console.log(struct);
console.log(struct.toBuffer());

console.log('ARRAY');
let array = new t.ArrayType(
  new t.UnsignedIntType()
);
console.log(array);
console.log(array.toBuffer());

console.log('SET');
let set = new t.SetType(
  new t.StructType([
    {name: 'long', type: new t.LongType()},
    {name: 'str', type: new t.StringType()}
  ])
);
console.log(set);
console.log(set.toBuffer());