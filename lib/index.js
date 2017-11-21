
				// source ./templates/UMD.js
				(function(factory){
					
					var _name = 'AutoBem',
						_global = typeof window === 'undefined' ? global : window,
						_module = {
							exports: {}
						};
				
					factory(_module, _module.exports, _global);
				
					if (typeof define === 'function' && define.amd) {
				        define([], function () {
				        	return _module.exports;
				        });
				        return;
				    } 
				    if (typeof module === 'object' && module.exports) {
				    	module.exports = _module.exports;
				    	return;
				    }
				
					if (_name) {
						_global[_name] = _module.exports;
					}
				
				}(function(module, exports, global){
					var _src_BemCss = {};
var _src_Selector = {};
var _src_globals = {};
var _src_parse_helpers = {};
var _src_selectorFlatten = {};
var _src_selectorMatches = {};
var _src_transform = {};
var _src_transform_exports = {};
var _src_transform_rewriteCss = {};
var _src_transform_rewriteMask = {};

				// source ./templates/ModuleSimplified.js
				var _src_parse_helpers;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function goTo(isEnd, str, i_, imax) {
    for (var i = i_; i < imax; i++) {
        var c = str.charCodeAt(i);
        if (isEnd(c, str, i)) {
            return i;
        }
    }
    return imax;
}
exports.goTo = goTo;
;
function goToGroupEnd(str, i, imax, startCode, endCode) {
    var count = 0, start = i, c;
    for (; i < imax; i++) {
        c = str.charCodeAt(i);
        if (c === 34 || c === 39) {
            // "|'
            i = goToQuoteEnd(str, i + 1, imax, c === 34 ? '"' : "'");
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
}
exports.goToGroupEnd = goToGroupEnd;
;
function goToQuoteEnd(str, i, imax, char_) {
    var start = i;
    while ((i = str.indexOf(char_, i)) !== -1) {
        if (str.charCodeAt(i - 1) !== 92 /*\*/) {
            return i;
        }
        i++;
    }
    console.warn('Quote was not closed', str, start - 1);
    return imax;
}
exports.goToQuoteEnd = goToQuoteEnd;
;
function isWhitespace(c) {
    return c < 33;
}
exports.isWhitespace = isWhitespace;
;
function isTokenChar(c) {
    if (c === 45 || c === 95) {
        // - _
        return true;
    }
    if ((48 <= c && c <= 57) || // 0-9
        (65 <= c && c <= 90) || // A-Z
        (97 <= c && c <= 122)) {
        return true;
    }
    return false;
}
exports.isTokenChar = isTokenChar;
;
function isLetter(c) {
    if ((65 <= c && c <= 90) || // A-Z
        (97 <= c && c <= 122)) {
        return true;
    }
    return false;
}
exports.isLetter = isLetter;
;
exports.isNotWhitespace = _not(isWhitespace);
exports.isNotTokenChar = _not(isTokenChar);
exports.isNotLetter = _not(isLetter);
function isCommentEnd(c, str, i) {
    if (c !== 42 /***/) {
        return false;
    }
    var n = str.charCodeAt(i + 1);
    if (n !== 47 /*/*/) {
        return false;
    }
    return true;
}
exports.isCommentEnd = isCommentEnd;
function isSelectorEnd(c, str, i) {
    return c === 123 /*{*/ || c === 44; /*,*/
}
exports.isSelectorEnd = isSelectorEnd;
function _not(fn) {
    return function (c, str, i) {
        return !fn(c, str, i);
    };
}
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_parse_helpers) && isObject(module.exports)) {
						Object.assign(_src_parse_helpers, module.exports);
						return;
					}
					_src_parse_helpers = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_Selector;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = _src_parse_helpers;
var Type;
(function (Type) {
    Type[Type["TAG"] = 1] = "TAG";
    Type[Type["CLASS"] = 2] = "CLASS";
    Type[Type["ID"] = 3] = "ID";
    Type[Type["UNIVERSAL"] = 4] = "UNIVERSAL";
    Type[Type["ATTR"] = 5] = "ATTR";
    Type[Type["PSEUDO"] = 6] = "PSEUDO";
})(Type = exports.Type || (exports.Type = {}));
;
var Selector = /** @class */ (function () {
    function Selector(parent) {
        this.child = null;
        this.rules = [];
        this.nestCount = 0;
        this.nextOperator = '';
        this.isHost = false;
        this.parent = parent;
        this.child = null;
        this.rules = [];
        this.nestCount = 0;
        this.nextOperator = '';
        this.isHost = false;
        this.top = parent || this;
        this.top.last = this;
    }
    Selector.prototype.add = function (type, str) {
        this.rules.push(new SelectorRule(type, str));
    };
    Selector.prototype.next = function (nextOperator) {
        this.child = new Selector(this);
        this.nextOperator = nextOperator;
        var x = this;
        while (x != null) {
            x.nestCount++;
            x = x.parent;
        }
        return this.child;
    };
    Selector.prototype.toArray = function () {
        var arr = [this];
        var x = this.child;
        while (x != null) {
            arr.push(x);
            x = x.child;
        }
        return arr;
    };
    Selector.prototype.toString = function () {
        var sel = '', x = this;
        while (x != null) {
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
    };
    Selector.prototype.stringifyRules = function (rules) {
        var str = '', i = -1, imax = rules.length;
        while (++i < imax)
            str += rules[i].str;
        return str;
    };
    Selector.parse = parse;
    Selector.fromArray = fromArray;
    Selector.Type = Type;
    return Selector;
}());
exports.Selector = Selector;
var SelectorRule = /** @class */ (function () {
    function SelectorRule(type, str) {
        this.type = type;
        this.str = str;
    }
    return SelectorRule;
}());
exports.SelectorRule = SelectorRule;
function parse(str) {
    var imax = str.length, i = -1, selector = new Selector(), top = selector, nestCount = 0, start;
    while (++i < imax) {
        var c = str.charCodeAt(i);
        if (c === 42 /*.*/) {
            selector.add(Type.UNIVERSAL, '*');
            continue;
        }
        var simpleType = (Utils.isLetter(c) && Type.TAG)
            || (c === 46 /*.*/ && Type.CLASS)
            || (c === 35 /*.*/ && Type.ID)
            || null;
        if (simpleType != null) {
            start = i;
            i = Utils.goTo(Utils.isNotTokenChar, str, i + 1, imax);
            selector.add(simpleType, str.substring(start, i));
            i--;
            continue;
        }
        if (c === 91 /*[*/) {
            start = i;
            i = Utils.goToGroupEnd(str, i + 1, imax, 91, 93 /*]*/);
            selector.add(Type.ATTR, str.substring(start, i + 1));
            continue;
        }
        if (c === 58 /*:*/) {
            start = i;
            if (str.charCodeAt(i + 1) === 58) {
                i++;
            }
            i = Utils.goTo(Utils.isNotTokenChar, str, i + 1, imax);
            if (start === 0 && str.substring(0, i) === ':host') {
                selector.isHost = true;
                i = Utils.goTo(Utils.isNotWhitespace, str, i, imax);
                if (str.charCodeAt(i) === 40 /*(*/) {
                    continue;
                }
                break;
            }
            if (str.charCodeAt(i) === 40 /*(*/) {
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
        if (c === 41 /*)*/) {
            if (top.isHost) {
                continue;
            }
            throw Error('Closing a group without a known context: ' + str);
        }
        if (c === 62 /*>*/ || c === 43 /*+*/ || c === 126 /*~*/) {
            next = str[i];
            if (next === '>' && str[i + 1] === '>' && str[i + 2] === '>') {
                next = '>>>';
                i += 2;
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
exports.parse = parse;
function fromArray(arr) {
    var first = arr[0];
    first.top = first;
    first.last = arr[arr.length - 1];
    var i = -1, imax = arr.length;
    while (++i < imax) {
        var x = arr[i], parent = null, child = null;
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
exports.fromArray = fromArray;
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_Selector) && isObject(module.exports)) {
						Object.assign(_src_Selector, module.exports);
						return;
					}
					_src_Selector = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_selectorMatches;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Selector_1 = _src_Selector;
var Utils = _src_parse_helpers;
var state_SELECTOR = 0, state_RULES = 1, state_MEDIA = 2, state_KEYFRAMES_HEADER = 10, state_KEYFRAMES = 11, state_KEYFRAME = 12;
function selectorMatches(str) {
    var matches = [];
    var state = state_SELECTOR;
    var imax = str.length, i = -1, token, start;
    while (++i < imax) {
        var c = str.charCodeAt(i);
        if (Utils.isWhitespace(c)) {
            continue;
        }
        switch (c) {
            case 47 /*/*/:
                c = str.charCodeAt(++i);
                if (c === 42 /***/) {
                    i = Utils.goTo(Utils.isCommentEnd, str, i, imax);
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
                i = Utils.goTo(Utils.isNotTokenChar, str, i, imax);
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
            i = Utils.goTo(Utils.isSelectorEnd, str, i, imax);
            matches.push(new Match(str.substring(start, i), start));
            i--;
        }
    }
    return matches;
}
exports.selectorMatches = selectorMatches;
;
var Match = /** @class */ (function () {
    function Match(selector, i) {
        this.str = selector.trim();
        this.i = i;
        this.selector = Selector_1.Selector.parse(this.str);
    }
    return Match;
}());
exports.Match = Match;
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_selectorMatches) && isObject(module.exports)) {
						Object.assign(_src_selectorMatches, module.exports);
						return;
					}
					_src_selectorMatches = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_selectorFlatten;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Selector_1 = _src_Selector;
var type_BLOCK = 1, type_HOST = 2;
function selectorFlatten(matches, opts) {
    if (matches == null || matches.length === 0) {
        return;
    }
    var flatten = null, type = type_HOST, block = getBlockByDescendant(matches);
    if (block != null) {
        flatten = flattenDescendant;
        type = type_BLOCK;
    }
    else {
        block = getBlockFromFilename(opts) || getBlockAny(matches);
        flatten = flattenDescendant; //-flattenHost;
    }
    var identity = getBlockIdentity(block, opts), imax = matches.length, i = -1;
    while (++i < imax) {
        flatten(matches[i], block, identity, type);
    }
}
exports.selectorFlatten = selectorFlatten;
;
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
    if (filename == null)
        return null;
    var name = /([^\/\\\.]+)\.(\w+)$/.exec(filename);
    return name && ('.' + name[1]);
}
function getBlockAny(matches) {
    var imax = matches.length, i = 0;
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
        var selector = match.selector, rules = selector.rules;
        var arr = selector.toArray();
        replaceElIdentities(match, identity, scopeType);
        var lastSel = arr[arr.length - 1];
        cleanTagRule(lastSel);
        cleanSingleElementSelectors(arr);
        match.selector = Selector_1.Selector.fromArray(arr);
    };
    var replaceElIdentities;
    (function () {
        replaceElIdentities = function (match, scopeIdentity, scopeType) {
            var mappings = match.mappings = [], selector = match.selector;
            if (selector.isHost) {
                selector.isHost = false;
                selector.rules.unshift({
                    str: scopeIdentity,
                    type: Selector_1.Type.CLASS
                });
                mappings.push({
                    query: Selector_1.Selector.parse(':host'),
                    klass: scopeIdentity
                });
                selector = selector.child;
            }
            else if (scopeType === type_BLOCK) {
                selector.rules[0] = {
                    str: scopeIdentity,
                    type: Selector_1.Type.CLASS
                };
                if (selector.rules.length > 1 || selector.child == null) {
                    mappings.push({
                        query: Selector_1.Selector.parse(':host'),
                        klass: scopeIdentity
                    });
                }
                selector = selector.child;
            }
            if (selector == null) {
                return;
            }
            var arr = selector.toArray(), i = arr.length;
            while (--i > -1) {
                replaceElIdentity(match, selector, arr[i], scopeIdentity);
            }
        };
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
                type: Selector_1.Type.CLASS
            };
        }
        function getElIdentity(top, selector, scopeIdentity) {
            var str = scopeIdentity, x = top;
            for (; x != null && x.parent !== selector; x = x.child) {
                if (x.isHost) {
                    continue;
                }
                var rule = x.rules[0];
                str += '__';
                if (rule.type === Selector_1.Type.TAG) {
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
            var selector = new Selector_1.Selector, out = selector;
            for (var x = topSel; x != null && x.parent !== endSel; x = x.child) {
                var r = x.rules[0];
                if (r.type === Selector_1.Type.TAG || r.type === Selector_1.Type.CLASS) {
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
        if (rules[0].type === Selector_1.Type.TAG) {
            rules.shift();
        }
    }
    function prependRule(selector, rule) {
        selector.rules.unshift(rule);
    }
    function cleanSingleElementSelectors(selectorsArr) {
        var i = selectorsArr.length - 1, lastWasRemoved = false;
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
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_selectorFlatten) && isObject(module.exports)) {
						Object.assign(_src_selectorFlatten, module.exports);
						return;
					}
					_src_selectorFlatten = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_transform_rewriteCss;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function rewriteCss(style, matches) {
    var i = matches.length;
    var out = style;
    while (--i > -1) {
        var x = matches[i];
        out = replace(out, x.i, x.str.length, x.selector.toString());
    }
    return out;
}
exports.rewriteCss = rewriteCss;
;
function replace(str, start, length, newStr) {
    return str.substring(0, start)
        + newStr
        + str.substring(start + length);
}
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_transform_rewriteCss) && isObject(module.exports)) {
						Object.assign(_src_transform_rewriteCss, module.exports);
						return;
					}
					_src_transform_rewriteCss = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_globals;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _global = typeof global === 'undefined' ? window : global;
exports.global = _global;
var _mask = typeof mask !== 'undefined' ? mask : (_global.mask || require('maskjs'));
exports.mask = _mask;
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_globals) && isObject(module.exports)) {
						Object.assign(_src_globals, module.exports);
						return;
					}
					_src_globals = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_transform_rewriteMask;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = _src_globals;
var Selector_1 = _src_Selector;
function rewriteMask(template, cssMatches) {
    var mappings = getMappings(cssMatches), imax = mappings.length, root = null;
    return globals_1.mask.TreeWalker.walk(template, function (node) {
        if (node.type === globals_1.mask.Dom.TEXTNODE) {
            return;
        }
        if (root == null) {
            root = node;
        }
        var i = -1;
        while (++i < imax)
            if (isMatch(root, node, mappings[i].query.last)) {
                mappings[i].match.found = true;
                prependKlass(node, mappings[i].klass);
            }
    });
}
exports.rewriteMask = rewriteMask;
;
function getMappings(cssMatches) {
    var out = [], i = cssMatches.length;
    var _loop_1 = function () {
        var match = cssMatches[i], arr = match.mappings;
        if (arr && arr.length > 0) {
            arr.forEach(function (x) { return x.match = match; });
            out.push.apply(out, arr);
        }
    };
    while (--i > -1) {
        _loop_1();
    }
    return out;
}
function prependKlass(node, str) {
    var name = str.substring(1);
    if (node.attr == null)
        node.attr = {};
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
    var parent = node.parent, selector = selectorLast.parent;
    for (; selector != null && parent != null && parent !== root.parent; parent = parent.parent) {
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
function isMatchSingle(root, node, selector) {
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
function containsRule(node, rule) {
    if (rule.type === Selector_1.Type.CLASS) {
        return hasClass(node, rule.str.substring(1));
    }
    if (rule.type === Selector_1.Type.TAG) {
        return node.tagName === rule.str;
    }
    throw new Error('Unsupported element`s css rule ' + rule.str);
}
function hasClass(node, klass) {
    var current = node.attr && node.attr.class;
    if (current == null)
        return false;
    return hasClassStrict(current, klass);
}
function hasClassStrict(a, b) {
    return (' ' + a + ' ').indexOf(' ' + b + ' ') > -1;
}
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_transform_rewriteMask) && isObject(module.exports)) {
						Object.assign(_src_transform_rewriteMask, module.exports);
						return;
					}
					_src_transform_rewriteMask = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_transform_exports;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rewriteCss_1 = _src_transform_rewriteCss;
var rewriteMask_1 = _src_transform_rewriteMask;
var globals_1 = _src_globals;
function transformTemplate(template, matches, options) {
    var minify = options && options.minify || false;
    var parserFn = options && options.templateType === 'mask'
        ? globals_1.mask.parse
        : globals_1.mask.parseHtml;
    var ast = parserFn(template);
    ast = rewriteMask_1.rewriteMask(ast, matches);
    var unmatchedElements = matches.filter(function (x) { return x.found !== true; });
    if (unmatchedElements.length !== 0) {
        unmatchedElements.forEach(function (match) {
            var error = new Error("\"" + match.str + "\" selector was not found");
            var reporter = options.reporter;
            if (reporter == null) {
                console.error(error.message);
                return;
            }
            reporter(error);
        });
    }
    return globals_1.mask.stringify(ast, { minify: minify });
}
exports.transformTemplate = transformTemplate;
;
function transformAst(ast, matches) {
    rewriteMask_1.rewriteMask(ast, matches);
}
exports.transformAst = transformAst;
;
function transformStyle(style, matches, options) {
    return rewriteCss_1.rewriteCss(style, matches);
}
exports.transformStyle = transformStyle;
;
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_transform_exports) && isObject(module.exports)) {
						Object.assign(_src_transform_exports, module.exports);
						return;
					}
					_src_transform_exports = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_transform;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exports_1 = _src_transform_exports;
var selectorMatches_1 = _src_selectorMatches;
var selectorFlatten_1 = _src_selectorFlatten;
function transform(template, style, options) {
    var matches = selectorMatches_1.selectorMatches(style);
    selectorFlatten_1.selectorFlatten(matches, options);
    var outTemplate = exports_1.transformTemplate(template, matches, options);
    var outStyle = exports_1.transformStyle(style, matches, options);
    return { template: outTemplate, css: outStyle };
}
exports.transform = transform;
;
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_transform) && isObject(module.exports)) {
						Object.assign(_src_transform, module.exports);
						return;
					}
					_src_transform = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				

				// source ./templates/ModuleSimplified.js
				var _src_BemCss;
				(function () {
					var exports = {};
					var module = { exports: exports };
					"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exports_1 = _src_transform_exports;
var globals_1 = _src_globals;
var selectorMatches_1 = _src_selectorMatches;
var selectorFlatten_1 = _src_selectorFlatten;
var BemCss = /** @class */ (function () {
    function BemCss(style, options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.matches = selectorMatches_1.selectorMatches(style);
        selectorFlatten_1.selectorFlatten(this.matches, this.options);
        this.style = exports_1.transformStyle(style, this.matches, this.options);
    }
    BemCss.prototype.transformTemplate = function (template, options) {
        var opts = globals_1.mask.obj.extend(options, this.options);
        return exports_1.transformTemplate(template, this.matches, opts);
    };
    BemCss.prototype.transformAst = function (ast) {
        exports_1.transformAst(ast, this.matches);
    };
    BemCss.prototype.getStyle = function () {
        return this.style;
    };
    BemCss.prototype.getSalt = function () {
        return this.options.salt;
    };
    return BemCss;
}());
exports.BemCss = BemCss;
;
;
				
					function isObject(x) {
						return x != null && typeof x === 'object' && x.constructor === Object;
					}
					if (isObject(_src_BemCss) && isObject(module.exports)) {
						Object.assign(_src_BemCss, module.exports);
						return;
					}
					_src_BemCss = module.exports;
				}());
				// end:source ./templates/ModuleSimplified.js
				
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Selector_1 = _src_Selector;
exports.Selector = Selector_1.Selector;
var selectorMatches_1 = _src_selectorMatches;
exports.selectorMatches = selectorMatches_1.selectorMatches;
var selectorFlatten_1 = _src_selectorFlatten;
exports.selectorFlatten = selectorFlatten_1.selectorFlatten;
var transform_1 = _src_transform;
exports.transform = transform_1.transform;
var BemCss_1 = _src_BemCss;
exports.BemCss = BemCss_1.BemCss;

				}));
				// end:source ./templates/UMD.js
				