/*eslint-disable*/
//From https://github.com/calebsander/strint, mostly not my code

//------------------- Addition

export function subPositive(x: string, y: string): string {
	forcePositiveString(x);
	forcePositiveString(y);
	/*istanbul ignore if*/
	if (!ge(x, y)) {
		throw new Error('x must be greater or equal to y');
	}

	var maxLength = Math.max(x.length, y.length);
	var result = '';
	var borrow = 0;
	var leadingZeros = 0;
	for (var i=0; i<maxLength; i++) {
		var lhs = Number(getDigit(x, i)) - borrow;
		borrow = 0;
		var rhs = Number(getDigit(y, i));
		while (lhs < rhs) {
			lhs += 10;
			borrow++;
		}
		var digit = String(lhs - rhs);
		if (digit !== '0') {
			result = digit + prefixZeros(result, leadingZeros);
			leadingZeros = 0;
		} else {
			leadingZeros++;
		}
	}
	return result.length === 0 ? '0' : result;
}

function addPositive(x: string, y: string): string {
	forcePositiveString(x);
	forcePositiveString(y);

	if (eq(x, '0') && eq(y, '0')) return '0'; //otherwise an empty string is returned

	var maxLength = Math.max(x.length, y.length);
	var result = '';
	var borrow = 0;
	var leadingZeros = 0;
	for (var i=0; i<maxLength; i++) {
		var lhs = Number(getDigit(x, i));
		var rhs = Number(getDigit(y, i));
		var digit = lhs + rhs + borrow;
		borrow = 0;
		while (digit >= 10) {
			digit -= 10;
			borrow++;
		}
		if (digit === 0) {
			leadingZeros++;
		} else {
			result = String(digit) + prefixZeros(result, leadingZeros);
			leadingZeros = 0;
		}
	}
	if (borrow > 0) {
		result = String(borrow) + prefixZeros(result, leadingZeros);
	}
	return result;
}
export function add(x: string, y: string): string {
	forceString(x);
	forceString(y);

	if (isPositive(x) && isPositive(y)) {
		return addPositive(x, y);
	} else if (isNegative(x) && isNegative(y)) {
		return negate(addPositive(abs(x), abs(y)));
	} else {
		if (lt(abs(x), abs(y))) {
			var tmp = x;
			x = y;
			y = tmp;
		}
		// |a| >= |b|
		var absResult = subPositive(abs(x), abs(y));
		if (isPositive(x)) {
			// Example: 5 + -3
			return absResult;
		} else {
			// Example: -5 + 3
			return negate(absResult);
		}
	}
}

export function sub(x: string, y: string): string {
	forceString(x);
	forceString(y);
	return add(x, negate(y));
}

//------------------- Multiplication

function mulDigit(strint: string, digit: number): string {
	forcePositiveString(strint);
	forceNumber(digit);
	var result = '';
	var digitCount = getDigitCount(strint);
	var carry = 0;
	var leadingZeros = 0;
	for(var i=0; i<digitCount; i++) {
		var digitResult = (Number(getDigit(strint, i)) * digit) + carry;
		carry = 0;
		while(digitResult >= 10) {
			digitResult -= 10;
			carry++;
		}
		if (digitResult === 0) {
			leadingZeros++;
		} else {
			result = String(digitResult) + prefixZeros(result, leadingZeros);
			leadingZeros = 0;
		}
	}
	if (carry > 0) {
		result = String(carry) + prefixZeros(result, leadingZeros);
	}
	return result.length === 0 ? '0' : result;
}
export {mulDigit as timesDigit};

export function mulPositive(lhs: string, rhs: string): string {
	/* Example via http://en.wikipedia.org/wiki/Multiplication_algorithm
			23958233
				5830 ×
		------------
				00000000 ( =      23,958,233 ×     0)
				71874699  ( =      23,958,233 ×    30)
			191665864   ( =      23,958,233 ×   800)
		119791165    ( =      23,958,233 × 5,000)
		------------
		139676498390 ( = 139,676,498,390        )
		*/

	forcePositiveString(lhs);
	forcePositiveString(rhs);
	var result = '0';
	var digitCount = getDigitCount(rhs);
	for(var i=0; i<digitCount; i++) {
		var singleRow = mulDigit(lhs, Number(getDigit(rhs, i)));
		singleRow = shiftLeft(singleRow, i);
		result = addPositive(result, singleRow);
	}
	return result;
}

export function mul(lhs: string, rhs: string): string {
	forceString(lhs);
	forceString(rhs);

	if (eq(lhs, '0') || eq(rhs, '0')) return '0'; //otherwise an empty string is returned
	var absResult = mulPositive(abs(lhs), abs(rhs));
	return (sameSign(lhs, rhs) ? absResult : negate(absResult));
}

//------------------- Division

 export function quotientRemainderPositive(dividend: string, divisor: string): [string, string] {
	/*
	Example division: 290 / 15

	29|0 = 0  // digits larger, can subtract
	15

	14|0 = 1  // digits smaller, must shift
	15

	140| = 10  // digits are 140, can subtract 9 times
		15

	(9 subtractions omitted)

		5| = 19  // divisor is now larger than the dividend, we are done: [19, 5]
		15
		*/

	forcePositiveString(dividend);
	forcePositiveString(divisor);

	if (eq(dividend, divisor)) {
		return [ '1', '0' ];
	}
	if (gt(divisor, dividend)) {
		return [ '0', normalize(dividend) ];
	}
	var quotient = '0';
	var remainingDigits = dividend.length - divisor.length;

	for (;;) {
		var digits = dividend.slice(0, dividend.length - remainingDigits);

		// Subtract as long as possible and count the times
		while (ge(digits, divisor)) {
			digits = sub(digits, divisor);
			quotient = add(quotient, '1');
		}
		dividend = digits + dividend.slice(dividend.length - remainingDigits);

		// Done already?
		if (gt(divisor, dividend)) { // holds (at the lastest) at remainingDigits === 0
			quotient = shiftLeft(quotient, remainingDigits);
			return [ quotient, normalize(dividend) ];
		}

		// Not done, shift
		remainingDigits--;
		quotient = shiftLeft(quotient, 1);
		/*istanbul ignore if*/
		if (remainingDigits < 0) {
			throw new Error('Illegal state');
		}
	}
}

export function div(dividend: string, divisor: string, floorNeg = false): string {
	forceString(dividend);
	forceString(divisor);

	var absResult = quotientRemainderPositive(abs(dividend), abs(divisor))[0];
	if (!sameSign(dividend, divisor)) absResult = negate(absResult);
	if (floorNeg && !eq(mul(absResult, divisor), dividend) && !sameSign(dividend, divisor)) absResult = sub(absResult, '1');
	return absResult;
}

//------------------- Comparisons

export function eq(lhs: string, rhs: string): boolean {
	return normalize(lhs) === normalize(rhs);
}

function ltPositive(x: string, y: string): boolean {
	/*istanbul ignore next*/
	if (isNegative(x) || isNegative(y)) {
		throw new Error('Both operands must be positive: '+x+' '+y);
	}
	var maxLength = Math.max(x.length, y.length);
	var lhs = leftPadZeros(x, maxLength);
	var rhs = leftPadZeros(y, maxLength);
	return lhs < rhs; // lexicographical comparison
}

export function lt(lhs: string, rhs: string): boolean {
	if (isNegative(lhs) && isPositive(rhs)) {
		return true;
	} else if (isPositive(lhs) && isNegative(rhs)) {
		return false;
	} else if (isNegative(lhs) && isNegative(rhs)) {
		// Example: -3 < -5
		return !eq(lhs, rhs) && !ltPositive(abs(lhs), abs(rhs));
	} else {
		return ltPositive(lhs, rhs);
	}
}

// x >= y <=> !(x < y)
export function ge(lhs: string, rhs: string): boolean {
	return !lt(lhs, rhs);
}

export function gt(lhs: string, rhs: string): boolean {
	if (eq(lhs, rhs)) return false;
	return ge(lhs, rhs);
}

//------------------- Signs

export function isNegative(strint: string): boolean {
	forceString(strint);
	return (strint.indexOf('-') === 0);
}

// Actually: isNonNegative
export function isPositive(strint: string): boolean {
	return !isNegative(strint);
}

export function abs(strint: string): string {
	if (isNegative(strint)) {
		return negate(strint);
	} else {
		return strint;
	}
}

function sameSign(lhs: string, rhs: string): boolean {
	return isPositive(lhs) === isPositive(rhs);
}

export function negate(strint: string): string {
	if (strint === '0') {
		return '0';
	}
	if (isNegative(strint)) {
		return strint.slice(1);
	} else {
		return '-'+strint;
	}
}

//------------------- Helpers

var RE_NON_ZERO = /^(-?)0*([1-9][0-9]*)$/;
var RE_ZERO = /^0+$/;
export function normalize(strint: string): string {
	if (RE_ZERO.test(strint)) {
		return '0';
	}
	var match = RE_NON_ZERO.exec(strint);
	if (!match) {
		throw new Error('Illegal strint format: '+strint);
	}
	return match[1]+match[2];
}

/**
 * Prefix zeros until the length of the number is `digitCount`.
 */
function leftPadZeros(strint: string, digitCount: number): string {
	forcePositiveString(strint);
	forceNonNegativeNumber(digitCount);

	return prefixZeros(strint, digitCount-strint.length);
}

function prefixZeros(strint: string, zeroCount: number): string {
	forcePositiveString(strint);
	forceNonNegativeNumber(zeroCount);

	var result = strint;
	for(var i=0; i<zeroCount; i++) {
		result = '0' + result;
	}
	return result;
}

function shiftLeft(strint: string, digitCount: number): string {
	while(digitCount > 0) {
		strint = strint + '0';
		digitCount--;
	}
	return strint;
}

/**
 * Works for negative numbers, too.
 * Index of rightmost digit is 0. Going too far left results in '0'.
 */
function getDigit(x: string, digitIndex: number): string {
	forceString(x);
	forceNumber(digitIndex);
	if (digitIndex >= getDigitCount(x)) {
		return '0';
	} else {
		return x.charAt(x.length - digitIndex - 1);
	}
}

function getDigitCount(strint: string): number {
	/*istanbul ignore if*/
	if (isNegative(strint)) {
		return strint.length -1;
	} else {
		return strint.length;
	}
}

//------------------- Type checks

function forceString(value: any) {
	forceType(value, 'string');
}
function forcePositiveString(value: any) {
	forceString(value);
	forceCondition(value, isPositive, 'isPositive');
}
function forceNumber(value: any) {
	forceType(value, 'number');
}
function forceNonNegativeNumber(value: any) {
	forceType(value, 'number');
	/*istanbul ignore if*/
	if (value < 0) {
		throw new Error('Expected a positive number: '+value);
	}
}
function forceCondition(value: any, condition: (value: any) => boolean, conditionName: string) {
	/*istanbul ignore if*/
	if (!condition.call(null, value)) {
		throw new Error('Condition '+conditionName+' failed for value '+value);
	}
}
function forceType(value: any, type: string) {
	/*istanbul ignore if*/
	if (typeof value !== type) {
		throw new Error('Not a '+type+': '+value);
	}
}

//The value needed to multiply an integer to shift it left 32 bits - for long math
export const LONG_UPPER_SHIFT = '4294967296';
//The value needed to multiply an integer to shift it left 8 bits - for big int math
export const BYTE_SHIFT = '256';