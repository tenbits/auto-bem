import { IOptions } from './IOptions';
import {
	transformStyle,
	transformTemplate,
	transformAst
} from'./transform/exports';

import {
	mask
} from './globals';


import { selectorMatches, Match } from './selectorMatches'
import { selectorFlatten } from './selectorFlatten'


export class BemCss {
	style: string
	matches: Match[]
	constructor (style: string, public options: IOptions = {}) {
		
		this.matches = selectorMatches(style);
		selectorFlatten(this.matches, this.options);		
		this.style = transformStyle(style, this.matches, this.options);
	}
	transformTemplate (template, options) {
		var opts = mask.obj.extend(options, this.options);
		return transformTemplate(template, this.matches, opts);
	}
	transformAst (ast) {
		transformAst(ast, this.matches);
	}
	getStyle () {
		return this.style;
	}
	getSalt () {
		return this.options.salt;
	}
};
