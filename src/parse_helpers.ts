export function goTo(isEnd: (c: number, str: string, i: number) => boolean, str: string, i_: number, imax: number) {
	for (var i = i_; i < imax; i++) {
		var c = str.charCodeAt(i);
		if (isEnd(c, str, i)) {
			return i;
		}
	}
	return imax;
};
export function goToGroupEnd(str: string, i: number, imax: number, startCode: number, endCode: number) {
	var count = 0,
		start = i,
		c;
	for (; i < imax; i++) {
		c = str.charCodeAt(i);
		if (c === 34 || c === 39) {
			// "|'
			i = goToQuoteEnd(
				str
				, i + 1
				, imax
				, c === 34 ? '"' : "'"
			);
			continue;
		}
		if (c === startCode) {
			count++;
			continue;
		}
		if (c === endCode) {
			if (--count === -1)
				return i;
		}
	}
	console.warn('Group was not closed', str, start);
	return imax;
};
export function goToQuoteEnd(str: string, i: number, imax: number, char_: string) {
	var start = i;
	while ((i = str.indexOf(char_, i)) !== -1) {
		if (str.charCodeAt(i - 1) !== 92 /*\*/) {
			return i;
		}
		i++;
	}
	console.warn('Quote was not closed', str, start - 1);
	return imax;
};

export function isWhitespace(c: number) {
	return c < 33;
};
export function isTokenChar(c: number) {
	if (c === 45 || c === 95) {
		// - _
		return true;
	}
	if ((48 <= c && c <= 57) ||		// 0-9
		(65 <= c && c <= 90) ||		// A-Z
		(97 <= c && c <= 122)) {	// a-z
		return true;
	}
	return false;
};
export function isLetter(c: number) {
	if ((65 <= c && c <= 90) ||		// A-Z
		(97 <= c && c <= 122)) {	// a-z
		return true;
	}
	return false;
};

export const isNotWhitespace = _not(isWhitespace);
export const isNotTokenChar = _not(isTokenChar);
export const isNotLetter = _not(isLetter);

export function isCommentEnd(c: number, str: string, i: number) {
	if (c !== 42/***/) {
		return false;
	}
	var n = str.charCodeAt(i + 1);
	if (n !== 47 /*/*/) {
		return false;
	}
	return true;
}
export function isSelectorEnd(c: number, str: string, i: number) {
	return c === 123 /*{*/ || c === 44 /*,*/
}

function _not(fn) {
	return function (c: number, str: string, i: number) {
		return !fn(c, str, i);
	}
}
