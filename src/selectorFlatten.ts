import { Selector, Type } from './Selector';

let type_BLOCK = 1,
	type_HOST = 2;

export function selectorFlatten(matches, opts) {
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
	while (++i < imax) {
		flatten(matches[i], block, identity, type);
	}
};

function getBlockIdentity(block, opts) {
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

function getBlockByDescendant(matches) {
	var selector = matches[0].selector;
	if (selector.rules.length === 0) {
		return null;
	}
	var first = selector.rules[0].str;
	var i = matches.length;
	while (--i > 0) {
		if (matches[i].selector.rules[0].str !== first) {
			return null;
		}
	}
	return first;
}
function getBlockFromFilename(opts) {
	var filename = opts && opts.filename;
	if (filename == null) return null;
	var name = /([^\/\\\.]+)\.(\w+)$/.exec(filename);
	return name && ('.' + name[1]);
}
function getBlockAny(matches) {
	var imax = matches.length,
		i = 0;
	while (++i < imax) {
		var str = matches[i].str;
		var m = /^[\.#]([\w_\-]+)/.exec(str);
		if (m && m[1]) {
			return '.' + m[1].substring(1);
		}
	}
	return null;
}

function genSalt() {
	return ((Math.random() * 10000) | 0).toString(36);
}

var flattenDescendant;
(function () {
	flattenDescendant = function (match, klass, identity, scopeType) {
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
	(function () {
		replaceElIdentities = function (match, scopeIdentity, scopeType) {
			var mappings = match.mappings = [],
				selector = match.selector;

			if (selector.isHost) {
				selector.isHost = false;
				selector.rules.unshift({
					str: scopeIdentity,
					type: Type.CLASS
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
					type: Type.CLASS
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
		function replaceElIdentity(match, top, selector, scopeIdentity) {
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
				type: Type.CLASS
			};
		}
		function getElIdentity(top, selector, scopeIdentity) {
			var str = scopeIdentity,
				x = top;
			for (; x != null && x.parent !== selector; x = x.child) {
				if (x.isHost) {
					continue;
				}
				var rule = x.rules[0];
				str += '__';
				if (rule.type === Type.TAG) {
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

			for (var x = topSel; x != null && x.parent !== endSel; x = x.child) {
				var r = x.rules[0];
				if (r.type === Type.TAG || r.type === Type.CLASS) {
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
	function getFirstComposedSelector(selectorsArr) {
		var i = -1, imax = selectorsArr.length - 1;
		while (++i < imax) {
			var x = selectorsArr[i];
			if (x.rules.length !== 1) {
				return x;
			}
		}
		return selectorsArr[imax];
	}
	function cleanTagRule(selector) {
		var rules = selector.rules;
		if (rules[0].type === Type.TAG) {
			rules.shift();
		}
	}
	function prependRule(selector, rule) {
		selector.rules.unshift(rule);
	}
	function cleanSingleElementSelectors(selectorsArr) {
		let i = selectorsArr.length - 1,
			lastWasRemoved: boolean = false;
		while (--i > -1) {
			var x = selectorsArr[i];
			if (x.rules.length !== 1) {
				if (lastWasRemoved === true) {
					x.nextOperator = ' ';
				}
				lastWasRemoved = false;
				continue;
			}
			selectorsArr.splice(i, 1);
			lastWasRemoved = true;
		}
	}
}());
