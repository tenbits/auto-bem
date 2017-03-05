var Selector;
(function(){
	Selector = autoBem_Selector = function Selector (parent) {
		this.parent = parent;
		this.child = null;
		this.rules = [];
		this.nestCount = 0;
		this.nextOperator = '';
		this.isHost = false;
		
		this.top = parent || this;
		this.top.last = this;
	};

	var Type = {
		TAG: 1,
		CLASS: 2,
		ID: 3,
		UNIVERSAL: 4,
		ATTR:5,
		PSEUDO:6,
	};

	Selector.parse = parse;
	Selector.fromArray = fromArray;
	Selector.Type = Type;
	Selector.prototype = {
		add: function (type, str) {
			this.rules.push(new SelectorRule(type, str));
		},
		next: function(nextOperator) {
			this.child = new Selector(this);
			this.nextOperator = nextOperator;			
			var x = this;
			while(x != null) {
				x.nestCount++;
				x = x.parent;
			}
			return this.child;
		},
		toArray: function(){
			var arr = [this];
			var x = this.child;
			while(x != null) {
				arr.push(x);
				x = x.child;
			}
			return arr;
		},
		toString: function(){
			var sel = '',
				x = this;
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
		},
		stringifyRules: function(rules){
			var str = '', i = -1, imax = rules.length;
			while(++i < imax) str += rules[i].str;
			return str;
		}

	};
	
	function SelectorRule (type, str) {
		this.type = type;
		this.str = str;
	}

	function parse (str) {
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
			
			var simpleType = (is_letter(c) && Type.TAG)
				|| (c === 46/*.*/ && Type.CLASS)
				|| (c === 35/*.*/ && Type.ID)
				|| null;

			if (simpleType != null) {
				start = i;
				i = parser_goTo(isNot_tokenChar, str, i + 1, imax);
				selector.add(simpleType, str.substring(start, i));
				i--;
				continue;
			}
			if (c === 91/*[*/) {
				start = i;
				i = parser_goToGroupEnd(str, i + 1, imax, 91, 93/*]*/);
				selector.add(Type.ATTR, str.substring(start, i + 1));
				continue;
			}
			if (c === 58/*:*/) {
				start = i;
				if (str.charCodeAt(i + 1) === 58) {
					i++;
				}
				i = parser_goTo(isNot_tokenChar, str, i + 1, imax);
				if (start === 0 && str.substring(0, i) === ':host') {
					selector.isHost = true;
					i = parser_goTo(isNot_whitespace, str, i, imax);					
					if (str.charCodeAt(i) === 40/*(*/) {
						continue;
					}
					break;
				}
				if (str.charCodeAt(i) === 40/*(*/) {
					i = parser_goToGroupEnd(str, i + 1, imax, 40, 41);
					i++;
				}
				selector.add(Type.PSEUDO, str.substring(start, i));
				i--;
				continue;
			}

			var next = null;
			if (is_whitespace(c)) {
				next = ' ';
				i = parser_goTo(isNot_whitespace, str, i, imax);
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
				i = parser_goTo(isNot_whitespace, str, i + 1, imax);
			}
			if (next != null) {
				i--;
				selector = selector.next(next);
				continue;
			}
		}
		return top;
	};

	function fromArray (arr) {
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

}());