const {
	transformStyle,
	transformTemplate,
} = require('./transform/exports');

const selectorMatches = require('./selectorMatches');
const selectorFlatten = require('./selectorFlatten');

module.exports = function (template, style, options) {

	let matches = selectorMatches(style);
	selectorFlatten(matches, options);

	let outTemplate = transformTemplate(template, matches, options);
	let outStyle = transformStyle(style, matches, options);

	return { template: outTemplate, css: outStyle };
};
