// @flow

import * as fetch from 'whatwg-fetch'
import AbortController from '../src/libs/abort-controller'

type localStorage = {
  getItem: (string) => string,
  setItem: (string, mixed) => void,
  removeItem: (string) => void
}

type location = {
  href: string,
  origin: string
}

type AbortSignal = {}

type Request = {
  signal?: AbortSignal
}

type FontFace = {
  status: string,
  load: () => void,
  loaded: Promise<{}>
}

declare var window: Node & {
  localStorage: localStorage,
  location: location,
  fetch: typeof fetch.fetch,
  alert: (string) => void,
  confirm: (string) => boolean,
  videojs: Object,
  AbortController?: typeof AbortController,
  Request: (string) => Request,
  Image: () => HTMLImageElement,
  FontFace: (name: string, src: string, descriptors: {
    family: string,
    style: string,
    weight: string | number
  }) => FontFace,
  setTimeout: (Function, number) => void,
  scrollTo: (number, number) => void
}
