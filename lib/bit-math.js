module.exports = {
	dividedByEight: n => n >>> 3, //efficiently divide by 8
	modEight: n => n & 0b111 //efficiently mod 8
};