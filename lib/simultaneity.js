const openSimultaneities = new Set

/*
	Runs multiple asynchronous tasks with a callback for when they have all finished
	Usage:
	let s = new Simultaneity
	s.addTask(() => {
		asynchSomething(() => {
			...
			s.taskFinished()
		})
	})
	...
	s.callback(() => {...})
*/
/*istanbul ignore next*/
module.exports = class {
	constructor() {
		this.tasks = new Set
		this.finishedCount = 0
	}
	//Adds a routine to be executed to start an asynchronous task
	addTask(start) {
		this.tasks.add(start)
	}
	//Should be called whenever an asynchronous task completes
	taskFinished() {
		this.finishedCount++
		if (this.finishedCount === this.tasks.size) { //all tasks have ended
			openSimultaneities.delete(this)
			this.done()
		}
	}
	//Set a callback for when all the tasks finish and start all the tasks
	callback(callback) {
		this.done = callback
		openSimultaneities.add(this)
		try {
			for (const startTask of this.tasks) startTask()
		}
		catch (e) {
			callback()
			throw e
		}
	}
	static endAll() {
		for (const openSimultaneity of openSimultaneities) openSimultaneity.done()
	}
}