// @flow
// import * as React from 'react'

declare module 'react-easy-state' {
  import type { ComponentType } from 'react'
  declare module.exports: {
    store: <T>(T) => T,
    view: (ComponentType<any>) => ComponentType<any>
  }
}
