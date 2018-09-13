import React from 'react';
import Header from './header/Header';
import Footer from './footer/Footer';
import Preloader from "../Preloader";
import {Route} from "react-router";
import './DefaultLayout.scss';

export default class DefaultLayout extends React.Component {
  render() {
    const {bundles, component: Component, ...rest} = this.props;
    return <Route {...rest} render={matchProps => <Preloader bundles={bundles}>
      <div className="default-layout">
        <Header/>
        <Component {...matchProps} />
        <Footer/>
      </div>
    </Preloader>
    }/>;
  }
}
