import {
	transformStyle,
	transformTemplate,
} from './transform/exports';

import { selectorMatches } from './selectorMatches'
import { selectorFlatten } from './selectorFlatten'

export function transform (template, style, options) {

	let matches = selectorMatches(style);
	selectorFlatten(matches, options);

	let outTemplate = transformTemplate(template, matches, options);
	let outStyle = transformStyle(style, matches, options);

	return { template: outTemplate, css: outStyle };
};
