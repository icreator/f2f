// @flow

import * as React from 'react'
import { store, view } from 'react-easy-state'
import * as jsonpath from 'jsonpath'
import Loader from '../components/Loader'

export const i18n: {
  lang: string,
  langs: { [string]: string},
  storageKey: string,
  loaded: boolean,
  translations: { [string]: { [string]: string }},
  setLanguage: (lang: string) => void,
  loadLangs: () => Promise<void>,
  preloadTranslation: () => Promise<void>,
  t: (string, ?{ [string]: mixed }) => string
} = store({
  lang: 'en',
  langs: { 'en': 'ENG' },
  storageKey: 'face2face_language',
  loaded: false,
  translations: {},
  setLanguage: (lang: string) => {
    i18n.lang = lang
    window.localStorage.setItem(i18n.storageKey, lang)
    // i18n.preloadTranslation()
  },
  loadLangs: async () => {
    const buildTime = process.env.REACT_APP_BUILD_TIME || '0'
    const langs = await window.fetch(`/locales/locales.json?v=${buildTime}`)
      .then((result): Promise<{ [string]: string }> => result.json())
    let lang = null
    const translations = {}

    for (let langCode in langs) {
      translations[langCode] = await window.fetch(`/locales/${langCode}/translation.json?v=${buildTime}`)
        .then((result): Promise<{ [string]: string }> => result.json())
    }

    const detectBrowserLanguage = () =>
      (navigator.languages && navigator.languages[0]) ||
      navigator.language

    if (window.localStorage.getItem(i18n.storageKey)) {
      lang = window.localStorage.getItem(i18n.storageKey)
    } else {
      lang = detectBrowserLanguage()
      lang = lang.split('-').shift()
    }

    if (langs.hasOwnProperty(lang) === -1) {
      lang = 'en'
    }
    i18n.langs = langs
    i18n.lang = lang
    i18n.translations = translations
    if (document.documentElement) {
      document.documentElement.lang = lang
    }
    window.localStorage.setItem(i18n.storageKey, lang)
  },
  preloadTranslation: async () => {
    const buildTime = process.env.REACT_APP_BUILD_TIME || '0'
    if (!i18n.translations.hasOwnProperty(i18n.lang)) {
      i18n.loaded = false
      i18n.translations[i18n.lang] = await window.fetch(`/locales/${i18n.lang}/translation.json?v=${buildTime}`)
        .then((result): Promise<{ [string]: string }> => result.json())
    }
    i18n.loaded = true
  },
  t: (string: string, variables: ?{ [string]: mixed }) => {
    let translatedString = string
    if (i18n.translations.hasOwnProperty(i18n.lang)) {
      const newString = jsonpath.value(i18n.translations[i18n.lang], string)
      if (newString) {
        translatedString = newString
      }
    }
    if (variables) {
      translatedString = translatedString.split(/({\w+})/)
      for (let variable in variables) {
        if (variables.hasOwnProperty(variable)) {
          const value = variables[variable]
          translatedString = translatedString.map(current => {
            if (current === `{${variable}}`) {
              if (typeof value === 'string' ||
              typeof value === 'number') {
                return `${value}`
              } else {
                console.warn(`Cannot coerce ${variable} (${typeof value}) to string`)
                return current
              }
            }
            return current
          })
        }
      }
      translatedString = translatedString.join()
    }
    return translatedString
  }
})

type TCPropTypes = {
  children: React.Node
}

class TC extends React.Component<TCPropTypes> {
  componentDidMount () {
    i18n.preloadTranslation()
  }

  render () {
    if (i18n.loaded) {
      document.title = i18n.t('windowTitle')
      return <div>{this.props.children}</div>
    } else {
      return <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <Loader />
      </div>
    }
  }
}

export const TranslationContainer = view(TC)

type TPropTypes = {
  string: string,
  variables: ?{ [string]: mixed }
}

class T extends React.Component<TPropTypes> {
  render () {
    return <span lang={i18n.lang}>{i18n.t(this.props.string, this.props.variables)}</span>
  }
}

export const Translate = view(T)
