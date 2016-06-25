const types = require(__dirname + '/structure-types.js');
const config = require(__dirname + '/config.js');

let combined = {};
for (let module of [types, config]) {
	for (let attribute in module) combined[attribute] = module[attribute];
}
module.exports = combined;