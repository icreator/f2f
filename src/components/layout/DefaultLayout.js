import React from 'react';
import Header from './header/Header';
import Footer from './footer/Footer';
import Preloader from "../Preloader";

export default class DefaultLayout extends React.Component {
  render() {
    return <Preloader bundles={this.props.bundles}>
      <div className="default-page">
        <Header/>
        {this.props.children}
        <Footer/>
      </div>
    </Preloader>;
  }
}
