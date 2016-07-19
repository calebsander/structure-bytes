exports.inspect = (obj) => {
	if (obj === undefined) return 'undefined';
	if (obj === null || (
			obj.constructor === Object ||
			obj.constructor === Array ||
			obj.constructor === String ||
			obj.constructor === Number ||
			obj.constructor === Boolean ||
			obj.constructor === Date
		)
	) return JSON.stringify(obj);
	if (obj.constructor.name) return obj.constructor.name + ' ' + JSON.stringify(obj);
	return JSON.stringify(obj);
};