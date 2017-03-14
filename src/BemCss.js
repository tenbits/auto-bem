var BemCss;
(function () {
	BemCss = autoBem_BemCss = function (style, options) {
		this.matches = autoBem_selectorMatches(style);
		autoBem_selectorFlatten(this.matches, options);

		this.style = transform_style(style, this.matches, options);
	};
	BemCss.prototype = {
		transformTemplate: function (template, options) {
			return transform_template(template, this.matches, options);
		},
		getStyle: function () {
			return this.style;
		}
	};
}());