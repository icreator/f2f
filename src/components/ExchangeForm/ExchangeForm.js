import React from 'react';
import {i18n} from "../i18n";
import './ExchangeForm.scss';
import CurrencySelector from "../base/CurrencySelector";

class ExchangeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amountIn: 0,
      amountOut: 0,
      rate: 20,
      in: {
        code: 'era',
        icon_light: '/img/currencies/era.png',
        icon_dark: '/img/currencies/era.png',
        name: 'Erachain (ERA)'
      },
      out: {
        code: 'compu',
        icon_light: '/img/currencies/compu.png',
        icon_dark: '/img/currencies/compu.png',
        name: 'Erachain (Compu)'
      },
      lastInput: 'in',
      rates: {
        era_compu: 20,
        compu_era: 1 / 20,
        btc_era: 50,
        era_btc: 1 / 50,
        btc_compu: 1000,
        compu_btc: 1/1000,
        era_era: 1,
        compu_compu: 1,
        btc_btc: 1
      }
    };
    this.setIn = this.setIn.bind(this);
    this.setOut = this.setOut.bind(this);
    this.setInAmount = this.setInAmount.bind(this);
    this.setOutAmount = this.setOutAmount.bind(this);
    this.swap = this.swap.bind(this);
  }

  setInAmount(event) {
    const value = event.target.value;
    const rate = this.state.rates[`${this.state.in.code}_${this.state.out.code}`];
    this.setState({
      lastInput: 'in',
      amountIn: value,
      amountOut: value * rate
    });
  }

  setOutAmount(event) {
    const value = event.target.value;
    const rate = this.state.rates[`${this.state.out.code}_${this.state.in.code}`];
    this.setState({
      lastInput: 'out',
      amountIn: value * rate,
      amountOut: value
    });
  }

  setIn(value) {
    if (this.state.lastInput === 'in') {
      const rate = this.state.rates[`${value.code}_${this.state.out.code}`];
      this.setState({
        in: value,
        amountOut: this.state.amountIn * rate
      });
    } else {
      const rate = this.state.rates[`${this.state.out.code}_${value.code}`];
      this.setState({
        in: value,
        amountIn: this.state.amountOut * rate
      });
    }
  }

  setOut(value) {
    if (this.state.lastInput === 'in') {
      const rate = this.state.rates[`${this.state.in.code}_${value.code}`];
      this.setState({
        out: value,
        amountOut: this.state.amountIn * rate
      })
    } else {
      const rate = this.state.rates[`${value.code}_${this.state.in.code}`];
      this.setState({
        out: value,
        amountIn: this.state.amountOut * rate
      })
    }
  }

  swap() {
    this.setState({
      in: this.state.out,
      out: this.state.in,
      amountIn: this.state.amountOut,
      amountOut: this.state.amountIn
    });
  }

  render() {
    const { amountIn, amountOut } = this.state;
    const currencies = [
      {code: 'era', icon_light: '/img/currencies/era.png', icon_dark: '/img/currencies/era.png', name: 'Erachain (ERA)'},
      {code: 'compu', icon_light: 'img/currencies/compu.png', icon_dark: '/img/currencies/compu.png', name: 'Erachain (Compu)'},
      {code: 'btc', icon_light: '/img/currencies/btc-light.png', icon_dark: '/img/currencies/btc-dark.png', name: 'Bitcoin (BTC)'}
    ];
    return <div className="exchange-form">
      <div className="column">
        <CurrencySelector value={this.state.in} onChange={this.setIn} data={currencies}/>
        <label>{i18n.t('calculator.exchange')}</label>
        <input value={amountIn} onInput={this.setInAmount}/>
        <div className="in-usd">
          <span>$0</span>
          <span>USD</span>
        </div>
      </div>
      <div className="swap-container">
        <a onClick={this.swap}>{i18n.t('calculator.swap')}</a>
      </div>
      <div className="column">
        <CurrencySelector value={this.state.out} onChange={this.setOut} data={currencies} />
        <label>{i18n.t('calculator.receive')}</label>
        <input value={amountOut} onInput={this.setOutAmount}/>
        <div className="in-usd">
          <span>$0</span>
          <span>USD</span>
        </div>
      </div>
    </div>
  }
}

export default ExchangeForm;
