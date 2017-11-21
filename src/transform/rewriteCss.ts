import { Match } from "../selectorMatches";

export function rewriteCss (style: string, matches: Match[]): string {
	var i = matches.length;
	var out = style;
	while(--i > -1) {
		var x = matches[i];
		out = replace(out, x.i, x.str.length, x.selector.toString());
	}
	return out;
};

function replace(str, start, length, newStr) {
	return str.substring(0, start) 
		+ newStr 
		+ str.substring(start + length)
		;
}
