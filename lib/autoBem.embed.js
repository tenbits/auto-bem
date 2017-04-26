


var autoBem_Selector,
	autoBem_selectorMatches,
	autoBem_selectorFlatten,
	autoBem_transform,
	autoBem_BemCss;

(function (mask) {
	
	// source parse_helpers
	var is_whitespace,	
		is_tokenChar,
		is_letter,
		isNot_whitespace,
		isNot_tokenChar,
		isNot_letter,
		
		is_commentEnd,
		is_selectorEnd,
		parser_goTo,
		parser_goToGroupEnd,
		parser_goToQuoteEnd;
	
	(function(){
		parser_goTo = function (isEnd, str, i_, imax) {
			for(var i = i_; i < imax; i++) {
				var c = str.charCodeAt(i);
				if (isEnd(c, str, i)) {
					return i;
				}
			}
			return imax;	
		};
		parser_goToGroupEnd = function(str, i, imax, startCode, endCode){
			var count = 0,
				start = i,
				c;
			for( ; i < imax; i++){
				c = str.charCodeAt(i);
				if (c === 34 || c === 39) {
					// "|'
					i = parser_goToQuoteEnd(
						str
						, i + 1
						, imax
						, c === 34 ? '"' : "'"
					);
					continue;
				}
				if (c === startCode) {
					count++;
					continue;
				}
				if (c === endCode) {
					if (--count === -1)
						return i;
				}
			}
			console.warn('Group was not closed', str, start);
			return imax;
		};
		parser_goToQuoteEnd = function(str, i, imax, char_){
			var start = i;
			while ((i = str.indexOf(char_, i)) !== -1) {
				if (str.charCodeAt(i - 1) !== 92 /*\*/){
					return i;
				}
				i++;
			}
			console.warn('Quote was not closed', str, start - 1);
			return imax;
		};
	
		is_whitespace = function (c) {
			return c < 33;
		};
		is_tokenChar = function (c) {
			if (c === 45 || c === 95) {
				// - _
				return true;
			}
			if ((48 <= c && c <= 57) ||		// 0-9
				(65 <= c && c <= 90) ||		// A-Z
				(97 <= c && c <= 122)) {	// a-z
				return true;
			}
			return false;
		};
		is_letter = function (c) {
			if ((65 <= c && c <= 90) ||		// A-Z
				(97 <= c && c <= 122)) {	// a-z
				return true;
			}
			return false;
		};
		
		isNot_whitespace = _not(is_whitespace);
		isNot_tokenChar = _not(is_tokenChar);
		isNot_letter = _not(is_letter);
	
		is_commentEnd = function (c, str, i) {
			if (c !== 42/***/) {
				return false;
			}
			var n = str.charCodeAt(i + 1);
			if (n !== 47 /*/*/) {
				return false;
			}
			return true;
		}
		is_selectorEnd = function (c, str, i) {
			return c === 123 /*{*/ || c === 44 /*,*/
		}
	
		function _not(fn) {
			return function (c, str, i) {
				return !fn(c, str, i);
			}
		}
	}());
	
	
	// end:source parse_helpers

	// source Selector
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
		}
	
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
	// end:source Selector

	// source selectorMatches
	(function(){
	
		var state_SELECTOR = 0,
			state_RULES = 1,
			state_MEDIA = 2,
			state_KEYFRAMES_HEADER = 10,
			state_KEYFRAMES = 11,
			state_KEYFRAME = 12;
	
		autoBem_selectorMatches = function (str) {
			var matches = [];
			var state = state_SELECTOR;
	
			var imax = str.length,
				i = -1,
				token, start;
	
			while (++i < imax) {
				var c = str.charCodeAt(i);
				if (is_whitespace(c)) {
					continue;
				}
				switch (c) {
					case 47 /*/*/:
						c = str.charCodeAt(++i);
						if (c === 42 /***/) {
							i = parser_goTo(is_commentEnd, str, i, imax);
							i += 2;
						}
						continue;
					case 44 /*,*/:
						if (state === state_SELECTOR) {
							continue;
						}
						break;
					case 123 /*{*/:
						switch (state) {
							case state_MEDIA:
								state = state_SELECTOR;
								continue;
							case state_KEYFRAMES_HEADER:
								state = state_KEYFRAMES;
								continue;					
							case state_KEYFRAMES:
								state = state_KEYFRAME;
								continue;					
							default:
								state = state_RULES;
								break;
						}
						continue;
					case 125 /*}*/:	
						if (state === state_KEYFRAME) {
							state = state_KEYFRAMES;
							continue;
						}
						state = state_SELECTOR;				
						continue;
					case 64 /*@*/:
						start = ++i;
						i = parser_goTo(isNot_tokenChar, str, i, imax);
						token = str.substring(start, i);
						if (token === 'media') {
							state = state_MEDIA;
						}
						if (token.indexOf('keyframes') !== -1) {
							state = state_KEYFRAMES_HEADER;
						}
						--i;
						continue;				
				}
				if (state === state_RULES) {
					continue;
				}
				if (state === state_SELECTOR) {
					start = i;
					i = parser_goTo(is_selectorEnd, str, i, imax);
					matches.push(new Match(str.substring(start, i), start));
					i--;
				}
			}
			return matches;
		};
	
		
		function Match (selector, i) {
			this.str = selector.trim();
			this.i = i;
			this.selector = autoBem_Selector.parse(this.str);
		}
		
	}());
	// end:source selectorMatches
	// source selectorFlatten
	(function(){
	
		var type_BLOCK = 1,
			type_HOST = 2;
	
		autoBem_selectorFlatten = function (matches, opts) {
			if (matches == null || matches.length === 0) {
				return;
			}
			var flatten = null,
				type = type_HOST,
				block = getBlockByDescendant(matches);
			if (block != null) {
				flatten = flattenDescendant;
				type = type_BLOCK;
			}
			else {
				block = getBlockFromFilename(opts) || getBlockAny(matches);
				flatten = flattenDescendant; //-flattenHost;
			}
			var identity = getBlockIdentity(block, opts),
				imax = matches.length,
				i = -1;
			while(++i < imax){
				flatten(matches[i], block, identity, type);
			}
		};
	
		function getBlockIdentity (block, opts) {
			if (opts == null) {
				return block + '_' + genSalt();
			}
	
			if (opts.scopeId) {
				return '.' + opts.scopeId;
			}
			if (opts.useSalt === false || opts.salt === '') {
				return block;
			}
			var salt = opts.salt || genSalt();
			if (salt !== opts.salt) {
				opts.salt = salt;
			}
			return block + '_' + salt;
		}
	
		function getBlockByDescendant (matches) {
			var selector = matches[0].selector;
			if (selector.rules.length === 0) {
				return null;
			}
			var first = selector.rules[0].str;
			var i = matches.length;
			while(--i > 0) {
				if (matches[i].selector.rules[0].str !== first) {
					return null;
				}
			}		
			return first;
		}
		function getBlockFromFilename (opts) {
			var filename = opts && opts.filename;
			if (filename == null) return null;
			var name = /([^\/\\\.]+)\.(\w+)$/.exec(filename);
			return name && ('.' + name[1]);
		}
		function getBlockAny (matches) {
			var imax = matches.length,
				i = 0;
			while(++i < imax){
				var str = matches[i].str;
				var m =  /^[\.#]([\w_\-]+)/.exec(str);
				if (m && m[1]) {
					return '.' + m[1].substring(1);
				}			
			}
			return null;
		}
		
		function genSalt () {
			return ((Math.random() * 10000) | 0).toString(36);
		}
	
		var flattenDescendant;
		(function(){
			flattenDescendant = function(match, klass, identity, scopeType) {
				var selector = match.selector,
					rules = selector.rules;
	
				var arr = selector.toArray();			
				replaceElIdentities(match, identity, scopeType);
				
				var lastSel = arr[arr.length - 1];
				cleanTagRule(lastSel)
	
				cleanSingleElementSelectors(arr);
	
				match.selector = Selector.fromArray(arr);
			};
	
			var replaceElIdentities;
			(function(){
				replaceElIdentities = function(match, scopeIdentity, scopeType) {
					var mappings = match.mappings = [],
						selector = match.selector;
	
					if (selector.isHost) {
						selector.isHost = false;
						selector.rules.unshift({
							str: scopeIdentity,
							type: Selector.Type.CLASS
						});
						mappings.push({
							query: Selector.parse(':host'),
							klass: scopeIdentity
						});
						selector = selector.child;
					}
					else if (scopeType === type_BLOCK) {
						selector.rules[0] = {
							str: scopeIdentity,
							type: Selector.Type.CLASS
						};
						if (selector.rules.length > 1 || selector.child == null) {
							mappings.push({
								query: Selector.parse(':host'),
								klass: scopeIdentity
							});
						}
						selector = selector.child;
					}
					if (selector == null) {
						return;
					}
	
					var arr = selector.toArray(),
						i = arr.length;
					while (--i > -1) {
						replaceElIdentity(match, selector, arr[i], scopeIdentity);
					}
				}
				function replaceElIdentity (match, top, selector, scopeIdentity) {
					if (selector.child != null && selector.rules.length === 0) {
						return;
					}
	
					var elIdentity = getElIdentity(top, selector, scopeIdentity);
	
					if (selector.child == null || selector.rules.length > 1) {
						match.mappings.unshift({
							query: toElQuery(top, selector),
							klass: elIdentity
						});
					}
					selector.rules[0] = {
						str: elIdentity,
						type: Selector.Type.CLASS
					};
				}
				function getElIdentity (top, selector, scopeIdentity) {
					var str = scopeIdentity,
						x = top;
					for(; x != null && x.parent !== selector; x = x.child) {
						if (x.isHost) {
							continue;
						}
						var rule = x.rules[0];
						str += '__';
						if (rule.type === Selector.Type.TAG) {
							str += 'tag_';
						}
						str += rule.str.replace(/[^\w]+/g, '');
						if (x.child != null && x !== selector && x.nextOperator === '>') {
							str += '__child';
						}
					}
					return str;
				}
				function toElQuery(topSel, endSel) {
					var selector = new Selector,
						out = selector;
	
					for(var x = topSel; x != null && x.parent !== endSel; x = x.child) {
						var r = x.rules[0];
						if (r.type === Selector.Type.TAG || r.type === Selector.Type.CLASS) {
							selector.rules.push(r);
							selector = selector.next(x.nextOperator);
						}
					}
					if (selector.rules.length === 0) {
						selector.parent.top.last = selector.parent;
						selector.parent.child = null;
					}
					return out;
				}
			}());
			
	
			// function toElQuery (selectorsArr, startIndex) {
			// 	var selector = new Selector,
			// 		top = selector,
			// 		arr = [], 
			// 		i = startIndex - 1, 
			// 		imax = selectorsArr.length;
	
			// 	var prevOperator = startIndex > 0 && selectorsArr[startIndex - 1].nextOperator;
			// 	if (prevOperator !== '>') {
			// 		prevOperator = '';
			// 	}
			// 	selector = selector.next(prevOperator);
			// 	while(++i < imax) {
			// 		var r = selectorsArr[i].rules[0];
			// 		if (r.type === Selector.Type.TAG || r.type === Selector.Type.CLASS) {
			// 			selector.rules.push(r);
			// 		}				
			// 		selector = selector.next(selectorsArr[i].nextOperator);
			// 	}
			// 	return top;
			// }
			function getFirstComposedSelector (selectorsArr) {
				var i = -1, imax = selectorsArr.length - 1;
				while(++i < imax) {
					var x  = selectorsArr[i];
					if (x.rules.length !== 1) {
						return x;
					}
				}
				return selectorsArr[imax];
			}
			function cleanTagRule (selector) {
				var rules = selector.rules;
				if (rules[0].type === Selector.Type.TAG) {
					rules.shift();
				}
			}
			function prependRule(selector, rule) {
				selector.rules.unshift(rule);
			}
			function cleanSingleElementSelectors (selectorsArr) {
				var i = selectorsArr.length - 1, 
					lastWasRemoved = false;
				while(--i > -1) {
					var x  = selectorsArr[i];
					if (x.rules.length !== 1) {
						if (lastWasRemoved === true) {
							x.nextOperator = ' ';
						}
						lastWasRemoved = false;
						continue;
					}
					selectorsArr.splice(i, 1);
					lastWasRemoved;
				}			
			}
		}());
		
	}());
	// end:source selectorFlatten
	// source transform
	// source transform/
	var transform_ast,
		transform_template,
		transform_style;
	
	(function () {
		// source ./rewriteCss
		var rewriteCss;
		(function () {
			rewriteCss = function (style, matches) {
				var i = matches.length;
				var out = style;
				while(--i > -1) {
					var x = matches[i];
					out = replace(out, x.i, x.str.length, x.selector.toString());
				}
				return out;
			};
		
			function replace(str, start, length, newStr) {
				return str.substring(0, start) 
					+ newStr 
					+ str.substring(start + length)
					;
			}
		}());
		// end:source ./rewriteCss
		// source ./rewriteMask
		var rewriteMask;
		(function(){
		
			rewriteMask = function (template, cssMatches) {
				var mappings = getMappings(cssMatches),
					imax = mappings.length,
					root = null;
		
				return mask_TreeWalker.walk(template, function (node) {
					if (node.type === mask.Dom.TEXTNODE) {
						return;
					}
					if (root == null) {
						root = node;
					}
		
					var i = -1;
					while(++i < imax) if (isMatch(root, node, mappings[i].query.last)) {
						prependKlass(node, mappings[i].klass);
					}
				});
			};
		
			function getMappings (cssMatches) {
				var out = [], i = cssMatches.length;
				while(--i > -1) {
					var arr = cssMatches[i].mappings;
					if (arr && arr.length > 0)
						out.push.apply(out, arr);
				}
				return out;
			}
			function prependKlass(node, str) {
				var name = str.substring(1);
		
				if (node.attr == null) node.attr = {};
				var current = node.attr.class;
				if (current == null) {
					node.attr.class = name;
					return;
				}
				if (hasClassStrict(current, name)) {
					return;
				}
				node.attr.class = name + ' ' + current;
			}
		
			function isMatch(root, node, selectorLast) {		
				if (isMatchSingle(root, node, selectorLast) === false) {
					return false;
				}
		
				var parent = node.parent,
					selector = selectorLast.parent;
		
				for (;selector != null && parent != null && parent !== root.parent; parent = parent.parent) {
					var match = isMatchSingle(root, parent, selector);
					if (match) {
						selector = selector.parent;
						continue;
					}
					if (selector.nextOperator === '>') {
						return false;
					}
					if (selector.nextOperator === ' ') {
						continue;
					}
					return false;
				}
				return selector == null;
			}
			function isMatchSingle (root, node, selector) {
				if (selector.isHost && node !== root) {
					return false;
				}		
				var imax = selector.rules.length;
				if (imax === 0) {
					if (selector.isHost) {
						return true;
					}
					throw new Error('At least one rule should be present');
				}		
				var i = -1;		
				while (++i < imax) {
					if (containsRule(node, selector.rules[i]) === false) {
						return false;
					}
				}
				return true;
			}
			
			function containsRule (node, rule) {
				if (rule.type === Selector.Type.CLASS) {
					return hasClass(node, rule.str.substring(1));
				}
				if (rule.type === Selector.Type.TAG) {
					return node.tagName === rule.str;
				}
				throw new Error('Unsupported element`s css rule ' + rule.str);
			}
			function hasClass(node, klass) {
				var current = node.attr && node.attr.class;
				if (current == null) return false;
				return hasClassStrict(current, klass);
			}
			function hasClassStrict(a, b) {
				return (' ' + a + ' ').indexOf(' ' + b + ' ') > -1;
			}
		}());
		// end:source ./rewriteMask
	
	
		transform_template = function (template, matches, options) {
			var minify = options && options.minify || false;
			var parserFn = options && options.templateType === 'mask'
				? mask.parse
				: mask.parseHtml
				;
	
			var ast = parserFn(template);
			
			ast = rewriteMask(ast, matches);
			return mask.stringify(ast, { minify: minify });
		};
		transform_ast = function (ast, matches) {
			rewriteMask(ast, matches);
		};
		transform_style = function (style, matches, options) {
			return rewriteCss(style, matches);
		};
	}());
	// end:source transform/
	
	autoBem_transform = function (template, style, options) {
	
		var matches = autoBem_selectorMatches(style);
		autoBem_selectorFlatten(matches, options);
	
	
		var outTemplate = transform_template(template, matches, options);
		var outStyle = transform_style(style, matches, options);
	
		return { template: outTemplate, css: outStyle };
	};
	
	// end:source transform
	// source BemCss
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
	// end:source BemCss
}(typeof Mask !== 'undefined' ? Mask : mask));
