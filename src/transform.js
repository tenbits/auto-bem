(function(){
	// import transform/
	
	autoBem_transform = function (template, style, options) {

		var matches = autoBem_selectorMatches(style);
		autoBem_selectorFlatten(matches, options);


		var outTemplate = transform_template(template, matches, options);
		var outStyle = transform_style(style, matches, options);

		return { template: outTemplate, css: outStyle };
	};

}());