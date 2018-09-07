import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {i18n} from "./components/i18n";

it('renders without crashing', async () => {
  const store = await i18n.loadLangs();
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
