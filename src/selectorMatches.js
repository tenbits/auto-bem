(function(){

	var state_SELECTOR = 0,
		state_RULES = 1,
		state_MEDIA = 2,
		state_KEYFRAMES_HEADER = 10,
		state_KEYFRAMES = 11,
		state_KEYFRAME = 12;

	autoBem_selectorMatches = function (str) {
		var matches = [];
		var state = state_SELECTOR;

		var imax = str.length,
			i = -1,
			token, start;

		while (++i < imax) {
			var c = str.charCodeAt(i);
			if (is_whitespace(c)) {
				continue;
			}
			switch (c) {
				case 47 /*/*/:
					c = str.charCodeAt(++i);
					if (c === 42 /***/) {
						i = parser_goTo(is_commentEnd, str, i, imax);
						i += 2;
					}
					continue;
				case 44 /*,*/:
					if (state === state_SELECTOR) {
						continue;
					}
					break;
				case 123 /*{*/:
					switch (state) {
						case state_MEDIA:
							state = state_SELECTOR;
							continue;
						case state_KEYFRAMES_HEADER:
							state = state_KEYFRAMES;
							continue;					
						case state_KEYFRAMES:
							state = state_KEYFRAME;
							continue;					
						default:
							state = state_RULES;
							break;
					}
					continue;
				case 125 /*}*/:	
					if (state === state_KEYFRAME) {
						state = state_KEYFRAMES;
						continue;
					}
					state = state_SELECTOR;				
					continue;
				case 64 /*@*/:
					start = ++i;
					i = parser_goTo(isNot_tokenChar, str, i, imax);
					token = str.substring(start, i);
					if (token === 'media') {
						state = state_MEDIA;
					}
					if (token.indexOf('keyframes') !== -1) {
						state = state_KEYFRAMES_HEADER;
					}
					--i;
					continue;				
			}
			if (state === state_RULES) {
				continue;
			}
			if (state === state_SELECTOR) {
				start = i;
				i = parser_goTo(is_selectorEnd, str, i, imax);
				matches.push(new Match(str.substring(start, i), start));
				i--;
			}
		}
		return matches;
	};

	
	function Match (selector, i) {
		this.str = selector.trim();
		this.i = i;
		this.selector = autoBem_Selector.parse(this.str);
	}
	
}());