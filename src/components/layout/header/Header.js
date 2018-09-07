import React from 'react';
import Menu from './Menu';
import './Header.scss';
import {i18n} from "../../i18n";

export default class Header extends React.Component {
  render() {
    let className = "header inner-header";
    let Logo = <img alt={i18n.t('logo.alt')} src="/img/logo.png" className="logo" />;

    if (this.props.main) {
      className = "header";
      Logo = '';
    }

    return <header className={className}>
      <div className="container">
        {Logo}
        <Menu main={this.props.main} />
      </div>
    </header>;
  }
}
