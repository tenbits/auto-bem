const {
	transformStyle,
	transformTemplate,
	transformAst
} = require('./transform/exports');

const {
	mask
} = require('./globals');


let selectorMatches = require('./selectorMatches'),
	selectorFlatten = require('./selectorFlatten');


module.exports = mask.class.create({
	constructor (style, options) {
		this.options = options || {};
		this.matches = selectorMatches(style);
		selectorFlatten(this.matches, this.options);

		this.style = transformStyle(style, this.matches, this.options);
	},
	transformTemplate (template, options) {
		var opts = mask.obj.extend(options, this.options);
		return transformTemplate(template, this.matches, opts);
	},
	transformAst (ast) {
		transformAst(ast, this.matches);
	},
	getStyle () {
		return this.style;
	},
	getSalt () {
		return this.options.salt;
	}
});
