import React from 'react';
import ReactDOM from 'react-dom';
import {i18n} from './components/i18n';

import './easter.js';

let root;
const init = async () => {
  await i18n.loadLangs();
  const App = require('./App').default;
  root = ReactDOM.render(<App />, document.querySelector('#root'), root);
};

if (module.hot) {
  module.hot.accept('./App', init);
}
init();
