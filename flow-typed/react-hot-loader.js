// @flow
declare module 'react-hot-loader' {
  import type { ComponentType } from 'react'
  declare function hot(typeof module): (ComponentType<any>) => ComponentType<any>
}
