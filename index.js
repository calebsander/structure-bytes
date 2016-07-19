let combined = {};
for (let module of ['config', 'io', 'read', 'structure-types']) {
	module = require(__dirname + '/' + module + '.js');
	for (let attribute in module) combined[attribute] = module[attribute];
}
module.exports = combined;