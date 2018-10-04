// @flow

declare module 'jsonpath' {
  declare module.exports: {
    value: (Object, string) => string,
    query: (Object, string) => Array<string>
  }
}
