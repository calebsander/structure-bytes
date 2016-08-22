//A replacement for util.inspect
//Not quite as complex and doesn't handle all the cases, but sufficient
exports.inspect = obj => {
	if (obj === undefined) return 'undefined'
	if (obj === null || (
			obj.constructor === Object ||
			obj.constructor === Array ||
			obj.constructor === String ||
			obj.constructor === Number ||
			obj.constructor === Boolean ||
			obj.constructor === Date
		)
	) return JSON.stringify(obj)
	if (obj.constructor === Set) {
		let result = 'Set {'
		const iterator = obj.values()
		let value = iterator.next()
		while (!value.done) {
			result += exports.inspect(value.value)
			value = iterator.next()
			if (!value.done) result += ', '
		}
		return result + '}'
	}
	if (obj.constructor === Map) {
		let result = 'Map {'
		const iterator = obj.entries()
		let value = iterator.next()
		while (!value.done) {
			result += exports.inspect(value.value[0])
			result += ' => '
			result += exports.inspect(value.value[1])
			value = iterator.next()
			if (!value.done) result += ', '
		}
		return result + '}'
	}
	if (obj.constructor.name) return obj.constructor.name + ' ' + JSON.stringify(obj)
	return JSON.stringify(obj)
}