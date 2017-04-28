let isWhitespace,	
	isTokenChar,
	isLetter,
	isNotWhitespace,
	isNotTokenChar,
	isNotLetter,	
	isCommentEnd,
	isSelectorEnd,
	goTo,
	goToGroupEnd,
	goToQuoteEnd;

(function(){
	goTo = function (isEnd, str, i_, imax) {
		for(var i = i_; i < imax; i++) {
			var c = str.charCodeAt(i);
			if (isEnd(c, str, i)) {
				return i;
			}
		}
		return imax;	
	};
	goToGroupEnd = function(str, i, imax, startCode, endCode){
		var count = 0,
			start = i,
			c;
		for( ; i < imax; i++){
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
	goToQuoteEnd = function(str, i, imax, char_){
		var start = i;
		while ((i = str.indexOf(char_, i)) !== -1) {
			if (str.charCodeAt(i - 1) !== 92 /*\*/){
				return i;
			}
			i++;
		}
		console.warn('Quote was not closed', str, start - 1);
		return imax;
	};

	isWhitespace = function (c) {
		return c < 33;
	};
	isTokenChar = function (c) {
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
	isLetter = function (c) {
		if ((65 <= c && c <= 90) ||		// A-Z
			(97 <= c && c <= 122)) {	// a-z
			return true;
		}
		return false;
	};
	
	isNotWhitespace = _not(isWhitespace);
	isNotTokenChar = _not(isTokenChar);
	isNotLetter = _not(isLetter);

	isCommentEnd = function (c, str, i) {
		if (c !== 42/***/) {
			return false;
		}
		var n = str.charCodeAt(i + 1);
		if (n !== 47 /*/*/) {
			return false;
		}
		return true;
	}
	isSelectorEnd = function (c, str, i) {
		return c === 123 /*{*/ || c === 44 /*,*/
	}

	function _not(fn) {
		return function (c, str, i) {
			return !fn(c, str, i);
		}
	}
}());

module.exports = {
	isWhitespace,	
	isTokenChar,
	isLetter,
	isNotWhitespace,
	isNotTokenChar,
	isNotLetter,	
	isCommentEnd,
	isSelectorEnd,
	goTo,
	goToGroupEnd,
	goToQuoteEnd
};