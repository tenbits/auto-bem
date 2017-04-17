var is_whitespace,	
	is_tokenChar,
	is_letter,
	isNot_whitespace,
	isNot_tokenChar,
	isNot_letter,
	
	is_commentEnd,
	is_selectorEnd,
	parser_goTo,
	parser_goToGroupEnd,
	parser_goToQuoteEnd;

(function(){
	parser_goTo = function (isEnd, str, i_, imax) {
		for(var i = i_; i < imax; i++) {
			var c = str.charCodeAt(i);
			if (isEnd(c, str, i)) {
				return i;
			}
		}
		return imax;	
	};
	parser_goToGroupEnd = function(str, i, imax, startCode, endCode){
		var count = 0,
			start = i,
			c;
		for( ; i < imax; i++){
			c = str.charCodeAt(i);
			if (c === 34 || c === 39) {
				// "|'
				i = parser_goToQuoteEnd(
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
	parser_goToQuoteEnd = function(str, i, imax, char_){
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

	is_whitespace = function (c) {
		return c < 33;
	};
	is_tokenChar = function (c) {
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
	is_letter = function (c) {
		if ((65 <= c && c <= 90) ||		// A-Z
			(97 <= c && c <= 122)) {	// a-z
			return true;
		}
		return false;
	};
	
	isNot_whitespace = _not(is_whitespace);
	isNot_tokenChar = _not(is_tokenChar);
	isNot_letter = _not(is_letter);

	is_commentEnd = function (c, str, i) {
		if (c !== 42/***/) {
			return false;
		}
		var n = str.charCodeAt(i + 1);
		if (n !== 47 /*/*/) {
			return false;
		}
		return true;
	}
	is_selectorEnd = function (c, str, i) {
		return c === 123 /*{*/ || c === 44 /*,*/
	}

	function _not(fn) {
		return function (c, str, i) {
			return !fn(c, str, i);
		}
	}
}());

