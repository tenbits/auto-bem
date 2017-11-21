import { rewriteCss } from './rewriteCss'
import { rewriteMask } from './rewriteMask'
import { Match } from '../selectorMatches'
import { mask } from '../globals'

export function transformTemplate (template, matches, options): string {
	var minify = options && options.minify || false;
	var parserFn = options && options.templateType === 'mask'
		? mask.parse
		: mask.parseHtml
		;

	var ast = parserFn(template);

	ast = rewriteMask(ast, matches);

	var unmatchedElements = matches.filter(x => x.found !== true);
	if (unmatchedElements.length !== 0) {
		unmatchedElements.forEach(match => {
			var error = new Error(`"${match.str}" selector was not found`);
			var reporter = options.reporter;
			if (reporter == null) {
				console.error(error.message);
				return;
			}
			reporter(error);
		})
	}
	return mask.stringify(ast, { minify: minify });
};
export function transformAst(ast, matches) {
	rewriteMask(ast, matches);
};
export function transformStyle(style: string, matches: Match[], options: any): string {
	return rewriteCss(style, matches);
};
