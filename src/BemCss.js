var BemCss;
(function () {
	BemCss = autoBem_BemCss = function (style, options) {
		this.options = options || {};
		this.matches = autoBem_selectorMatches(style);
		autoBem_selectorFlatten(this.matches, this.options);

		this.style = transform_style(style, this.matches, this.options);
	};
	BemCss.prototype = {
		transformTemplate: function (template, options) {
			var opts = mask.obj.extend(options, this.options);
			return transform_template(template, this.matches, opts);
		},
		transformAst: function (ast) {
			transform_ast(ast, this.matches);
		},
		getStyle: function () {
			return this.style;
		},
		getSalt: function () {
			return this.options.salt;
		}
	};
}());