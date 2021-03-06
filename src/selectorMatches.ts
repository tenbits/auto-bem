import { Selector } from './Selector';
import * as Utils from './parse_helpers';

var state_SELECTOR = 0,
	state_RULES = 1,
	state_MEDIA = 2,
	state_KEYFRAMES_HEADER = 10,
	state_KEYFRAMES = 11,
	state_KEYFRAME = 12;

export function selectorMatches(str: string): Match[] {
	var matches = [];
	var state = state_SELECTOR;

	var imax = str.length,
		i = -1,
		token, start;

	while (++i < imax) {
		var c = str.charCodeAt(i);
		if (Utils.isWhitespace(c)) {
			continue;
		}
		switch (c) {
			case 47 /*/*/:
				c = str.charCodeAt(++i);
				if (c === 42 /***/) {
					i = Utils.goTo(Utils.isCommentEnd, str, i, imax);
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
				i = Utils.goTo(Utils.isNotTokenChar, str, i, imax);
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
			i = Utils.goTo(Utils.isSelectorEnd, str, i, imax);
			matches.push(new Match(str.substring(start, i), start));
			i--;
		}
	}
	return matches;
};


export class Match {
	str: string
	i: number
	selector: Selector
	mappings: MatchMapping[]
	constructor (selector: string, i: number) {
		this.str = selector.trim();
		this.i = i;
		this.selector = Selector.parse(this.str);
	}
}

export class MatchMapping {
	query: Selector
	klass: string
}