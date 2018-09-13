import React from 'react';
import ReactDOM from 'react-dom';
import {i18n} from './components/i18n';
import App from "./App";

import './easter.js';

i18n.loadLangs()
  .then(() => {
    ReactDOM.render(<App />, document.querySelector('#root'));
  });
