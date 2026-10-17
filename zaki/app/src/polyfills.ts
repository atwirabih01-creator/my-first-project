// Tiny polyfills so the web build runs on older iPhone Safari (iOS 13+).
// Loaded first by index.js, before Expo Router starts. Each one is only added if missing.
/* eslint-disable no-extend-native */
const AP = Array.prototype as unknown as Record<string, unknown>;

if (!AP.findLast) {
  Object.defineProperty(Array.prototype, 'findLast', {
    configurable: true,
    writable: true,
    value: function findLast<T>(this: T[], fn: (v: T, i: number, a: T[]) => unknown, thisArg?: unknown) {
      for (let i = this.length - 1; i >= 0; i--) if (fn.call(thisArg, this[i], i, this)) return this[i];
      return undefined;
    },
  });
}
if (!AP.findLastIndex) {
  Object.defineProperty(Array.prototype, 'findLastIndex', {
    configurable: true,
    writable: true,
    value: function findLastIndex<T>(this: T[], fn: (v: T, i: number, a: T[]) => unknown, thisArg?: unknown) {
      for (let i = this.length - 1; i >= 0; i--) if (fn.call(thisArg, this[i], i, this)) return i;
      return -1;
    },
  });
}
function at<T>(this: ArrayLike<T>, n: number) {
  const len = this.length;
  let k = Math.trunc(n) || 0;
  if (k < 0) k += len;
  return k < 0 || k >= len ? undefined : this[k];
}
if (!AP.at) Object.defineProperty(Array.prototype, 'at', { configurable: true, writable: true, value: at });
if (!(String.prototype as unknown as Record<string, unknown>).at) {
  Object.defineProperty(String.prototype, 'at', { configurable: true, writable: true, value: at });
}
if (!(String.prototype as unknown as Record<string, unknown>).replaceAll) {
  Object.defineProperty(String.prototype, 'replaceAll', {
    configurable: true,
    writable: true,
    value: function replaceAll(this: string, search: string | RegExp, replacement: string) {
      if (search instanceof RegExp) return this.replace(search, replacement);
      return this.split(search).join(replacement);
    },
  });
}
const O = Object as unknown as Record<string, unknown>;
if (!O.hasOwn) {
  Object.defineProperty(Object, 'hasOwn', {
    configurable: true,
    writable: true,
    value: (obj: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(obj, key),
  });
}
const G = globalThis as unknown as Record<string, unknown>;
if (typeof G.structuredClone !== 'function') {
  G.structuredClone = (v: unknown) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
}

export {};
