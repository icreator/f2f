import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { i18n } from '../../i18n';

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdown: false,
      current: i18n.lang
    };
    this.dropdown = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.dropdown.current && !this.dropdown.current.contains(event.target)) {
      this.setState({
        dropdown: false
      });
    }
  }

  render() {
    const langs = [];
    let dropdown = '';
    let onClick = () => {};
    const currentLang = i18n.langs[i18n.lang];

    if (this.props.main) {
      onClick = () => {
        const element = document.querySelector('#about-us');
        element.scrollIntoView();
      }
    }

    for (let code in i18n.langs) {
      if (!i18n.langs.hasOwnProperty(code)) {
        continue;
      }
      let className = '';
      const lang = i18n.langs[code];
      if (code === this.state.current) {
        className = "current";
      }
      langs.push(<li className={className} key={code}>
        <a onClick={() => {
          this.setState({
            dropdown: false
          });
          i18n.setLanguage(code);
        }} onMouseOver={() => this.setState({
          current: code
        })}>
          {lang}
        </a>
      </li>);
    }

    if (this.state.dropdown) {
      dropdown = <ul className="dropdown-list">
        {langs}
      </ul>;
    }

    return <nav className="menu">
      <Link to="/#about-us" onClick={onClick}>{i18n.t('menu.about')}</Link>
      <NavLink to="/payments">{i18n.t('menu.payments')}</NavLink>
      <NavLink to="/support">{i18n.t('menu.support')}</NavLink>
      <div ref={this.dropdown} className="dropdown-container">
        <button onClick={() => this.setState({
          dropdown: !this.state.dropdown,
          current: i18n.lang
        })}>
          {currentLang}
          <i className="dropdown-arrow" />
        </button>
        {dropdown}
      </div>
    </nav>;
  }
}
