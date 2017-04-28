const _global = typeof global === 'undefined' ? window : global;
const _mask = typeof mask !== 'undefined' ? mask : (_global.mask || require('maskjs'));

module.exports = {
	mask: _mask,
	global: _global
};