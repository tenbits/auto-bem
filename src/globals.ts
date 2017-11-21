declare var global: any
declare var window: any
declare var mask: any

const _global = typeof global === 'undefined' ? window : global;
const _mask = typeof mask !== 'undefined' ? mask : (_global.mask || require('maskjs'));

export { _mask as mask };
export { _global as global };