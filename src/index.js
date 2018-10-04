// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'
import { i18n } from './state/i18n'
import state from './state/state'
import { PreloaderRoute } from './components/Preloader'
import DefaultLayout from './layout/DefaultLayout'
import IndexPage from './pages/IndexPage/IndexPage'
import ExchangePage from './pages/ExchangePage/ExchangePage'
import PaymentsPage from './pages/PaymentsPage/PaymentsPage'
import SupportPage from './pages/SupportPage/SupportPage'
import ErrorPage from './pages/ErrorPage/ErrorPage'
import './easter.js'
import './index.scss'

class App extends React.Component<{}> {
  render () {
    // $FlowFixMe
    return <Router basename={process.env.PUBLIC_URL} onUpdate={() => window.scrollTo(0, 0)}>
      <Switch>
        <PreloaderRoute exact path='/' bundles={['index']} component={IndexPage} />
        <DefaultLayout bundles={['exchange']} path='/exchange' component={ExchangePage} />
        <DefaultLayout bundles={['support']} path='/support' component={SupportPage} />
        <DefaultLayout bundles={['payments']} path='/payments' component={PaymentsPage} />
        <PreloaderRoute path='*' bundles={['index']} component={ErrorPage} />
      </Switch>
    </Router>
  }
}

const Application = hot(module)(App)

i18n.loadLangs()
  .then(() => state.loadCurrencies())
  .then(() => {
    const root = document.querySelector('#root')
    if (root) {
      ReactDOM.render(<Application />, root)
    } else {
      console.log('Root application element doesn\'t exist')
    }
  })
