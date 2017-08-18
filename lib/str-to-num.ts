export default (str: any): number | undefined => {
	if (str) { //avoid errors with undefined.constructor and null.constructor; also '' is invalid
		if (str.constructor === String) {
			const converted = Number(str)
			if (!isNaN(converted)) return converted
		}
	}
	return //returned if conversion failed
}