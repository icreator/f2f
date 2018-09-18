import React from 'react';
import {i18n} from "../../state/i18n";
import state from '../../state/state';
import {fetch} from 'whatwg-fetch';
import {view} from 'react-easy-state';
import AbortController from '../../libs/abort-controller';
import CurrencySelector from "../CurrencySelector/CurrencySelector";
import './ExchangeForm.scss';
import CurrencyInput from "../CurrencyInput/CurrencyInput";

const abortableFetch = ('signal' in new Request('')) ? window.fetch : fetch

class ExchangeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rate: '',
      lastInput: 'in',
      rates: {},
      in_loading: false,
      out_loading: false,
      out_error: false
    };
    if (state.calculator.in.name === undefined) {
      state.calculator.in = state.currencies.in.COMPU;
    }
    if (state.calculator.out.name === undefined) {
      state.calculator.out = state.currencies.out.BTC;
    }
  }

  setInAmount = (event) => {
    const amountIn = event.target.value;
    const {in: curr_in, out: curr_out} = state.calculator;
    state.calculator.amountIn = amountIn;
    state.calculator.usdValue = amountIn * state.getRate('usd', curr_in.id);
    this.setState({
      lastInput: 'in',
      out_loading: true,
      out_error: false
    });
    this.loadRate(curr_in.id, curr_out.id, amountIn)
      .then(r => {
        state.calculator.amountOut = r.volume_out;
        state.calculator.rate = r.rate;
        this.setState({
          out_loading: false,
        });
      }, e => {
        if (e.name !== "AbortError") {
          this.setState({
            out_error: true
          })
        }
      });
  };

  // setOutAmount = (event) => {
  //   const value = event.target.value;
  //   const rate = this.state.rates[`${this.state.out.code}_${this.state.in.code}`];
  //   this.setState({
  //     lastInput: 'out',
  //     amountIn: value * rate,
  //     amountOut: value
  //   });
  // };

  setIn = (curr_in) => {
    // if (this.state.lastInput === 'in') {
    const {out, amountIn} = state.calculator;
    state.calculator.in = curr_in;
    state.calculator.usdValue = amountIn * state.getRate('usd', curr_in.id);
    this.setState({
      out_loading: true,
      out_error: false
    });
    this.loadRate(curr_in.id, out.id, amountIn)
      .then(r => {
        state.calculator.rate = r.rate;
        state.calculator.amountOut = r.volume_out;
        this.setState({
          out_loading: false
        })
      }, e => {
        if (e.name !== "AbortError") {
          this.setState({
            out_error: true
          })
        }
      });
    // } else {
    //   const rate = this.state.rates[`${this.state.out.code}_${value.code}`];
    //   this.setState({
    //     in: value,
    //     amountIn: this.state.amountOut * rate
    //   });
    // }
  };

  setOut = (out) => {
    // if (this.state.lastInput === 'in') {
    const {in: curr_in, amountIn} = state.calculator;
    state.calculator.out = out;
    this.setState({
      out_loading: true,
      out_error: false
    });
    this.loadRate(curr_in.id, out.id, amountIn)
      .then(r => {
        state.calculator.rate = r.rate;
        state.calculator.amountOut = r.volume_out;
        this.setState({
          out_loading: false,
        })
      }, e => {
        if (e.name !== "AbortError") {
          this.setState({
            out_error: true
          })
        }
      });
    // } else {
    //   const rate = this.state.rates[`${value.code}_${this.state.in.code}`];
    //   this.setState({
    //     out: value,
    //     amountIn: this.state.amountOut * rate
    //   })
    // }
  };

  swap = () => {
    const {in: curr_out, out: curr_in, amountOut: amountIn} = state.calculator;
    state.calculator.in = curr_in;
    state.calculator.out = curr_out;
    state.calculator.amountIn = amountIn;
    state.calculator.usdValue = amountIn * state.getRate('usd', curr_in.id);
    this.setState({
      out_loading: true,
      out_error: false
    });
    this.loadRate(curr_in.id, curr_out.id, amountIn)
      .then(r => {
        state.calculator.amountOut = r.volume_out;
        state.calculator.rate = r.rate;
        this.setState({
          out_loading: false
        })
      }, e => {
        if (e.name !== "AbortError") {
          this.setState({
            out_error: true
          })
        }
      });
  };

  loadRate = (curr_in, curr_out, amount) => {
    // eslint-disable-next-line eqeqeq
    if (amount == 0) {
      return new Promise(resolve => resolve({
        volume_out: 0,
        rate: 0
      }));
    }
    let signal;
    if (this.abortController !== undefined) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    signal = this.abortController.signal;
    return abortableFetch(`${state.serverName}/apipay/get_rate.json/${curr_in}/${curr_out}/${amount}`, {
      signal
    })
      .then(r => r.json());
  };

  render() {
    const {
      amountIn,
      amountOut,
      in: curr_in,
      out: curr_out,
      usdValue,
      rate
    } = state.calculator;
    return <div className="exchange-form">
      <div className="column">
        <CurrencySelector value={curr_in} onChange={this.setIn} data={state.currencies.in}/>
        <label>{i18n.t('calculator.exchange')}</label>
        <CurrencyInput value={amountIn} onInput={this.setInAmount} loading={this.state.in_loading}/>
        <div className="in-usd">
          <span>${usdValue.toLocaleString(i18n.t('intl'), {
            minimumFractionDigits: 2
          })}</span>
          <span>USD</span>
        </div>
      </div>
      <div className="swap-container">
        <a onClick={this.swap}>{i18n.t('calculator.swap')}</a>
      </div>
      <div className="column">
        <CurrencySelector value={curr_out} onChange={this.setOut} data={state.currencies.out}/>
        <label>{i18n.t('calculator.receive')}</label>
        <CurrencyInput
          value={amountOut}
          onInput={this.setOutAmount}
          loading={this.state.out_loading}
          error={this.state.out_error}
        />
        <div className="in-usd">
          <span>{i18n.t('calculator.rate')}</span>
          <span>{rate}</span>
        </div>
      </div>
    </div>
  }
}

export default view(ExchangeForm);
