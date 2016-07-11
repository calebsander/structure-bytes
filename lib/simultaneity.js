const assert = require(__dirname + '/assert.js');

const openSimultaneities = new Set();

module.exports = class {
	constructor() {
		this.tasks = new Set();
		this.finishedCount = 0;
	}
	addTask(start) {
		this.tasks.add(start);
	}
	taskFinished() {
		this.finishedCount++;
		if (this.finishedCount === this.tasks.size) {
			openSimultaneities.delete(this);
			this.done();
		}
	}
	callback(callback) {
		this.done = callback;
		openSimultaneities.add(this);
		for (let startTask of this.tasks) startTask();
	}
	static endAll() {
		for (let openSimultaneity of openSimultaneities) openSimultaneity.done();
	}
};