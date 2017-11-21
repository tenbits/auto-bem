import * as Utils from './parse_helpers';


export enum Type {
	TAG = 1,
	CLASS = 2,
	ID = 3,
	UNIVERSAL = 4,
	ATTR = 5,
	PSEUDO = 6,
};

export class Selector {
	parent: Selector
	child: Selector = null;
	rules: SelectorRule[] = []
	nestCount = 0
	nextOperator = ''
	isHost = false
	top: Selector
	last: Selector	
	constructor (parent?: Selector) {
		this.parent = parent;
		this.child = null;
		this.rules = [];
		this.nestCount = 0;
		this.nextOperator = '';
		this.isHost = false;
		
		this.top = parent || this;
		this.top.last = this;
	}
	add (type, str) {
		this.rules.push(new SelectorRule(type, str));
	}
	next (nextOperator) {
		this.child = new Selector(this);
		this.nextOperator = nextOperator;			
		let x:Selector = this;
		while(x != null) {
			x.nestCount++;
			x = x.parent;
		}
		return this.child;
	}
	toArray () {
		let arr: Selector[] = [this];
		let x = this.child;
		while(x != null) {
			arr.push(x);
			x = x.child;
		}
		return arr;
	}
	toString () {
		var sel = '',
			x:Selector = this;
		while(x != null) {
			sel += this.stringifyRules(x.rules);
			if (x.child == null) {
				break;
			}
			sel += x.nextOperator;
			x = x.child;
		}
		if (this.isHost) {
			return sel === ''
				? ':host'
				: ':host(' + sel + ')';
		}
		return sel;
	}
	stringifyRules (rules) {
		var str = '', i = -1, imax = rules.length;
		while(++i < imax) str += rules[i].str;
		return str;
	}

	static parse = parse;
	static fromArray = fromArray;
	static Type = Type
}


export class SelectorRule {
	constructor (public type: Type, public str:string) {
		
	}
}

export function parse (str) {
	var imax = str.length,
		i = -1,
		selector = new Selector(),
		top = selector,
		nestCount = 0, 
		start;
	
	while(++i < imax) {
		var c = str.charCodeAt(i);
		if (c === 42/*.*/) {
			selector.add(Type.UNIVERSAL, '*');
			continue;
		}
		
		var simpleType = (Utils.isLetter(c) && Type.TAG)
			|| (c === 46/*.*/ && Type.CLASS)
			|| (c === 35/*.*/ && Type.ID)
			|| null;

		if (simpleType != null) {
			start = i;
			i = Utils.goTo(Utils.isNotTokenChar, str, i + 1, imax);
			selector.add(simpleType, str.substring(start, i));
			i--;
			continue;
		}
		if (c === 91/*[*/) {
			start = i;
			i = Utils.goToGroupEnd(str, i + 1, imax, 91, 93/*]*/);
			selector.add(Type.ATTR, str.substring(start, i + 1));
			continue;
		}
		if (c === 58/*:*/) {
			start = i;
			if (str.charCodeAt(i + 1) === 58) {
				i++;
			}
			i = Utils.goTo(Utils.isNotTokenChar, str, i + 1, imax);
			if (start === 0 && str.substring(0, i) === ':host') {					
				selector.isHost = true;
				i = Utils.goTo(Utils.isNotWhitespace, str, i, imax);					
				if (str.charCodeAt(i) === 40/*(*/) {
					continue;
				}
				break;
			}
			if (str.charCodeAt(i) === 40/*(*/) {
				i = Utils.goToGroupEnd(str, i + 1, imax, 40, 41);
				i++;
			}
			selector.add(Type.PSEUDO, str.substring(start, i));
			i--;
			continue;
		}

		var next = null;
		if (Utils.isWhitespace(c)) {
			next = ' ';
			i = Utils.goTo(Utils.isNotWhitespace, str, i, imax);
			c = str.charCodeAt(i);
		}
		if (c === 41/*)*/) {
			if (top.isHost) {
				continue;
			}
			throw Error('Closing a group without a known context: ' + str);
		}
		if (c === 62/*>*/ || c === 43/*+*/ || c === 126/*~*/) {
			next = str[i];
			if (next === '>' && str[i+1] === '>' && str[i+2] === '>') {
				next = '>>>';
				i+= 2;
			}
			i = Utils.goTo(Utils.isNotWhitespace, str, i + 1, imax);
		}
		if (next != null) {
			i--;
			selector = selector.next(next);
			continue;
		}
	}
	return top;
}

export function fromArray (arr) {
	var first = arr[0];
	first.top = first;
	first.last = arr[arr.length - 1];

	var i = -1,
		imax = arr.length;
	while(++i < imax) {
		var x = arr[i],
			parent = null, 
			child = null;

		if (i > 0) {
			parent = arr[i - 1];
		}
		if (i < imax - 1) {
			child = arr[imax - 1];
		}
		x.child = child;
		x.parent = parent;
		x.top = first;
		x.nestCount = imax - i - 1;
	}
	return first;
}