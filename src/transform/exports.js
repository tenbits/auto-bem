var transform_template,
	transform_style;

(function () {
	// import ./rewriteCss
	// import ./rewriteMask


	transform_template = function (template, matches, options) {
		var minify = options && options.minify || false;
		var parserFn = options && options.templateType === 'mask'
			? mask.parse
			: mask.parseHtml
			;

		var ast = parserFn(template);
		
		ast = rewriteMask(ast, matches);
		return mask.stringify(ast, { minify: minify });
	};

	transform_style = function (style, matches, options) {
		return rewriteCss(style, matches);
	};
}());