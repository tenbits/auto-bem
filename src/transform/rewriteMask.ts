import { mask } from '../globals';
import { Selector, Type } from '../Selector';
import { Match } from '../selectorMatches';

export function rewriteMask (template: string, cssMatches: Match[]) {
	

	var mappings = getMappings(cssMatches),
		imax = mappings.length,
		root = null;
	return mask.TreeWalker.walk(template, function (node) {
		if (node.type === mask.Dom.TEXTNODE) {
			return;
		}
		if (root == null) {
			root = node;
		}
		
		var i = -1;		
		while(++i < imax) {
			if (isMatch(root, node, mappings[i].query.last)) {
				mappings[i].match.found = true;
				prependKlass(node, mappings[i].klass);
			}
		}
	});
};

function getMappings (cssMatches) {	
	var out = [], i = cssMatches.length;
	while(--i > -1) {
		let match = cssMatches[i],
			arr = match.mappings;
		if (arr && arr.length > 0) {
			arr.forEach(x => x.match = match);
			out.push(...arr);
		}
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
	
	/** traverse mask tree and selector parts */
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
	if (rule.type === Type.CLASS) {
		return hasClass(node, rule.str.substring(1));
	}
	if (rule.type === Type.TAG) {
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
