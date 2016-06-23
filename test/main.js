const t = require(__dirname + '/../structure-types.js');

let struct = new t.StructType([
  {name: 'bobbé', type: new t.BooleanType()},
  {name: '', type: new t.IntType()}
]);
console.log(struct);
console.log(struct.toBuffer());