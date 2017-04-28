var transformAst,
	transformTemplate,
	transformStyle;

(function () {
	const rewriteCss  = require('./rewriteCss');
	const rewriteMask = require('./rewriteMask');

	transformTemplate = function (template, matches, options) {
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
	transformAst = function (ast, matches) {
		rewriteMask(ast, matches);
	};
	transformStyle = function (style, matches, options) {
		return rewriteCss(style, matches);
	};
}());

module.exports = {
	transformAst,
	transformTemplate,
	transformStyle
};