import React, { Component } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import { TranslationContainer } from "./components/i18n";
import { PreloaderRoute } from "./components/Preloader";
import DefaultLayout from './components/layout/DefaultLayout';
import IndexPage from "./components/pages/IndexPage/IndexPage";
import ExchangePage from './components/pages/ExchangePage/ExchangePage';
import PaymentsPage from "./components/pages/PaymentsPage";
import FAQPage from './components/pages/FAQPage';
import './App.scss';

class App extends Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL} onUpdate={() => window.scrollTo(0,0)}>
        <Switch>
          <PreloaderRoute exact path="/" bundles={["index", "currencies"]} component={IndexPage}/>
          <DefaultLayout bundles={["exchange", "currencies"]} path="/exchange/:currency1/:currency2/:amount" component={ExchangePage}/>
          <DefaultLayout bundles={["exchange", "currencies"]} path="/exchange/:currency1/:currency2" component={ExchangePage}/>
          <DefaultLayout bundles={["exchange", "currencies"]} path="/exchange" component={ExchangePage}/>
          <DefaultLayout bundles={["faq"]} path="/faq" component={FAQPage}/>
          <DefaultLayout bundles={["payments"]} path="/payments" component={PaymentsPage}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
