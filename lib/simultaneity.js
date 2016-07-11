const assert = require(__dirname + '/assert.js');

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
		if (this.finishedCount === this.tasks.size) this.done();
	}
	callback(callback) {
		this.done = callback;
		for (let startTask of this.tasks) startTask();
	}
};