const config = require(__dirname + '/config.js');
const io = require(__dirname + '/io.js');
const read = require(__dirname + '/read.js');
const types = require(__dirname + '/structure-types.js');

let combined = {};
for (let module of [config, io, read, types]) {
	for (let attribute in module) combined[attribute] = module[attribute];
}
module.exports = combined;