var transform_mask;
(function(){

	var jmask = mask.jmask;

	transform_mask = function (template, cssMatches) {
		var mappings = getMappings(cssMatches),
			imax = mappings.length,
			root = null;

		return mask_TreeWalker.walk(template, function (node) {
			if (root == null) root = node;

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

		for (;selector != null && parent != null && parent != root.parent; 
				selector = selector.parent, 
				parent = parent.parent
			) {
			var match = isMatchSingle(root, parent, selector);
			if (match) {
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
		var imax = selector.rules.length,
			i = -1;

		if (imax === 0) {
			if (selector.isHost) {
				return true;
			}

			console.log(selector);
			throw new Error('At least one rule should be present');
		}
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
		if (rule.type === Selector.Type.CLASS) {
			return node.tagName === rule.str;
		}
		throw new Error('Unsupported element`s css rule ' + rule.str);
	};
	function hasClass(node, klass) {
		var current = node.attr && node.attr.class;
		if (current == null) return false;
		return hasClassStrict(current, klass);
	};
	function hasClassStrict(a, b) {
		return (' ' + a + ' ').indexOf(' ' + b + ' ') > -1;
	}

	
}());