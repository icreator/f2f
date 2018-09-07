import React from 'react';
import {i18n} from "../i18n";
import "./CurrencySelector.scss";

class CurrencySelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdown: false,
      current: this.props.value.code
    };
    this.dropdown = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.setValue = this.setValue.bind(this);
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
        dropdown: false,
        current: this.props.value.code
      });
    }
  }

  setValue(currency) {
    this.setState({
      dropdown: false,
    });
    this.props.onChange(currency);
  }

  render() {
    let dropdown = '';
    let value = `-- ${i18n.t('calculator.placeholder')} --`;
    let fieldClass = "field";

    if (this.state.dropdown) {
      dropdown = [];
      fieldClass += " active";
      for (let currency of this.props.data) {
        let className = currency.code === this.state.current?'current':'';
        dropdown.push(<li
          key={currency.name}
          className={className}
          onClick={() => this.setValue(currency)}
          onMouseOver={() => this.setState({
            current: currency.code
          })}
        >
          <img alt={currency.code} src={currency.icon_light} className="currency-icon"/> <span className="currency-name">{currency.name}</span>
        </li>)
      }
      dropdown = <ul className="dropdown">
        {dropdown}
      </ul>
    }

    if (this.props.value) {
      value = [
        <img alt={this.props.value.code} key="icon" src={this.props.value.icon_light} className="currencyIcon"/>,
        <span key="name" className="currency-name">{this.props.value.name}</span>
      ];
    }

    return <div ref={this.dropdown} className="currency-selector-container">
      <div className={fieldClass} onClick={() => this.setState({
        dropdown: !this.state.dropdown,
        current: this.props.value.code
      })}>
        {value}
      </div>
      <input type="hidden" />
      {dropdown}
    </div>
  }
}

export default CurrencySelector;
