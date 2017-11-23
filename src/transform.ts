import {
	transformStyle,
	transformTemplate,
} from './transform/exports';

import { selectorMatches } from './selectorMatches'
import { selectorFlatten } from './selectorFlatten'
import { IOptions } from './IOptions';

export function transform (template, style, options: IOptions) {

	let matches = selectorMatches(style);
	selectorFlatten(matches, options);
	

	let outTemplate = transformTemplate(template, matches, options);
	let outStyle = transformStyle(style, matches, options);

	return { template: outTemplate, css: outStyle };
};
