import React from 'react';
import { store, view } from 'react-easy-state';
import * as jsonpath from "jsonpath";
import Loader from "../components/Loader";

export const i18n = store({
  lang: 'en',
  langs: ['en'],
  storageKey: 'face2face_language',
  loaded: false,
  translations: {},
  setLanguage: (lang) => {
    i18n.lang = lang;
    localStorage.setItem(i18n.storageKey, lang);
    //i18n.preloadTranslation()
  },
  loadLangs: async () => {
    const langs = await fetch(`/locales/locales.json?v=${process.env.BUILD_TIME}`)
      .then(result => result.json());
    let lang = null;
    const translations = {};

    for (let langCode in langs) {
      translations[langCode] = await fetch(`/locales/${langCode}/translation.json?v=${process.env.BUILD_TIME}`)
        .then(result => result.json());
    }

    const detectBrowserLanguage = () =>
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.userLanguage;

    if (localStorage.getItem(i18n.storageKey)) {
      lang = localStorage.getItem(i18n.storageKey);
    } else {
      lang = detectBrowserLanguage();
      lang = lang.split('-').shift();
    }

    if (langs.hasOwnProperty(lang) === -1) {
      lang = 'en';
    }
    i18n.langs = langs;
    i18n.lang = lang;
    i18n.translations = translations;
    document.documentElement.lang = lang;
    localStorage.setItem(i18n.storageKey, lang);
  },
  preloadTranslation: async () => {
    if (!i18n.translations.hasOwnProperty(i18n.lang)) {
      i18n.loaded = false;
      i18n.translations[i18n.lang] = await fetch(`/locales/${i18n.lang}/translation.json?v=${process.env.BUILD_TIME}`)
        .then(result => result.json());
    }
    i18n.loaded = true;
  },
  t: (string, variables) => {
    let translatedString = string;
    if (i18n.translations.hasOwnProperty(i18n.lang)) {
      const newString = jsonpath.value(i18n.translations[i18n.lang], string);
      if (newString) {
        translatedString = newString;
      }
    }
    if (variables) {
      translatedString = translatedString.split(/({\w+})/);
      for (let variable in variables) {
        if (variables.hasOwnProperty(variable)) {
          const value = variables[variable];
          translatedString = translatedString.map(current => {
            if (current === `{${variable}}`) {
              return value;
            }
            return current;
          });
        }
      }
    }
    return translatedString;
  }
});

class TC extends React.Component {
  componentDidMount() {
    i18n.preloadTranslation();
  }

  render() {
    if (i18n.loaded) {
      document.title = i18n.t('windowTitle');
      return <div>{this.props.children}</div>
    } else {
      return <div style={{display: "flex", width: "100vw", height: "100vh", justifyContent: "center", alignItems: "center"}}>
        <Loader/>
      </div>;
    }
  }
}

export const TranslationContainer = view(TC);

class T extends React.Component {
  render() {
    return <span lang={i18n.lang}>{i18n.t(this.props.string, this.props.variables)}</span>;
  }
}

export const Translate = view(T);
