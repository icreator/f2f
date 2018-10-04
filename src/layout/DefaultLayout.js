// @flow
import React from 'react'
import { Route } from 'react-router'
import Preloader from '../components/Preloader'
import Header from './header/Header'
import Footer from './footer/Footer'
import './DefaultLayout.scss'

type PropTypes = {
  bundles: Array<string>,
  component: React.ComponentType<any>
}

export default class DefaultLayout extends React.Component<PropTypes> {
  render () {
    const { bundles, component: Component, ...rest } = this.props
    return <Route {...rest} render={(matchProps: Object) => <Preloader bundles={bundles}>
      <div className='default-layout'>
        <Header main={false} />
        <Component {...matchProps} />
        <Footer />
      </div>
    </Preloader>
    } />
  }
}
