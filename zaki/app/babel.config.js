// Web builds must also run on older iPhones (iOS 13+ Safari). These plugins turn newer
// JavaScript syntax (??=, ||=, ?., ??, class fields) into older syntax, for WEB ONLY.
// Missing built-in methods (findLast, at, ...) are filled in by src/polyfills.ts.
module.exports = function (api) {
  const platform = api.caller((caller) => caller && caller.platform);
  api.cache.using(() => platform);
  const legacyWeb =
    platform === 'web'
      ? [
          '@babel/plugin-transform-logical-assignment-operators',
          '@babel/plugin-transform-nullish-coalescing-operator',
          '@babel/plugin-transform-optional-chaining',
          ['@babel/plugin-transform-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        ]
      : [];
  return { presets: ['babel-preset-expo'], plugins: legacyWeb };
};
