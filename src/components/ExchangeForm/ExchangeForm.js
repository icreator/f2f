import React from 'react'
import { i18n } from '../../state/i18n'
import state from '../../state/state'
import { fetch } from 'whatwg-fetch'
import { view } from 'react-easy-state'
import AbortController from '../../libs/abort-controller'
import CurrencySelector from '../CurrencySelector/CurrencySelector'
import './ExchangeForm.scss'
import CurrencyInput from '../CurrencyInput/CurrencyInput'

const abortableFetch = ('signal' in new window.Request('')) ? window.fetch : fetch
const NewAbortController = ('AbortController' in window) ? window.AbortController : AbortController

class ExchangeForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      rate: '',
      lastInput: 'in',
      rates: {},
      in_loading: false,
      out_loading: false,
      out_error: false
    }
    if (state.calculator.in.name === undefined) {
      state.calculator.in = state.currencies.in.COMPU
    }
    if (state.calculator.out.name === undefined) {
      state.calculator.out = state.currencies.out.BTC
    }
  }

  recalculateOutAmount = (currInId, currOutId, amountIn) => {
    this.setState({
      lastInput: 'in',
      out_loading: true,
      out_error: false
    })
    if (typeof this.props.onChange === 'function') {
      this.props.onChange()
    }
    const availableAmountOut = state.getAvailableAmount(currOutId)
    this.loadRate(currInId, currOutId, amountIn)
      .then(({ volume_out: amountOut, rate }) => {
        let exceeded = false
        if (amountOut > availableAmountOut) {
          exceeded = true
        }
        state.calculator = {
          ...state.calculator,
          amountOut,
          rate,
          exceeded
        }
        this.setState({
          out_loading: false
        })
      }, e => {
        if (e.name !== 'AbortError') {
          this.setState({
            out_error: true
          })
          console.log(e)
        }
      })
  };

  setInAmount = (event) => {
    const amountIn = event.target.value
    const { in: currIn, out: currOut } = state.calculator
    state.calculator = {
      ...state.calculator,
      amountIn,
      usdValue: amountIn * state.getRate('usd', currIn.code)
    }
    this.recalculateOutAmount(currIn.id, currOut.id, amountIn)
  };

  setOutAmount = (event) => {
  //   const value = event.target.value;
  //   const rate = this.state.rates[`${this.state.out.code}_${this.state.in.code}`];
  //   this.setState({
  //     lastInput: 'out',
  //     amountIn: value * rate,
  //     amountOut: value
  //   });
  };

  setIn = (currIn) => {
    // if (this.state.lastInput === 'in') {
    const { out, amountIn } = state.calculator
    state.calculator = {
      ...state.calculator,
      in: currIn,
      usdValue: amountIn * state.getRate('usd', currIn.code)
    }
    this.recalculateOutAmount(currIn.id, out.id, amountIn)
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
    const { in: currIn, amountIn } = state.calculator
    state.calculator = {
      ...state.calculator,
      out
    }
    this.recalculateOutAmount(currIn.id, out.id, amountIn)
    // } else {
    //   const rate = this.state.rates[`${value.code}_${this.state.in.code}`];
    //   this.setState({
    //     out: value,
    //     amountIn: this.state.amountOut * rate
    //   })
    // }
  };

  swap = () => {
    const { in: out, out: currIn, amountOut: amountIn } = state.calculator
    state.calculator = {
      ...state.calculator,
      in: currIn,
      out,
      amountIn,
      usdValue: amountIn * state.getRate('usd', currIn.code)
    }
    this.recalculateOutAmount(currIn.id, out.id, amountIn)
  };

  loadRate = (currIn, currOut, amount) => {
    let signal
    if (this.abortController !== undefined) {
      this.abortController.abort()
    }
    // eslint-disable-next-line eqeqeq
    if (amount == 0) {
      return new Promise(resolve => resolve({
        volume_out: 0,
        rate: 0
      }))
    }
    this.abortController = new NewAbortController()
    signal = this.abortController.signal
    return abortableFetch(`${state.serverName}/apipay/get_rate.json/${currIn}/${currOut}/${amount}`, {
      signal
    })
      .then(r => r.json())
  };

  render () {
    const {
      amountIn,
      amountOut,
      in: currIn,
      out: currOut,
      usdValue,
      rate
    } = state.calculator
    return <div className='exchange-form'>
      <div className='column'>
        <CurrencySelector value={currIn} onChange={this.setIn} data={state.currencies.in} />
        <label>{i18n.t('calculator.exchange')}</label>
        <CurrencyInput value={amountIn} onInput={this.setInAmount} loading={this.state.in_loading} />
        <div className='in-usd'>
          <span>${usdValue.toLocaleString(i18n.t('intl'), {
            minimumFractionDigits: 2
          })}</span>
          <span>USD</span>
        </div>
      </div>
      <div className='swap-container'>
        <a onClick={this.swap}>{i18n.t('calculator.swap')}</a>
      </div>
      <div className='column'>
        <CurrencySelector value={currOut} onChange={this.setOut} data={state.currencies.out} />
        <label>{i18n.t('calculator.receive')}</label>
        <CurrencyInput
          value={amountOut}
          onInput={this.setOutAmount}
          loading={this.state.out_loading}
          error={this.state.out_error}
        />
        <div className='in-usd'>
          <span>{i18n.t('calculator.rate')}</span>
          <span>{rate}</span>
        </div>
      </div>
    </div>
  }
}

export default view(ExchangeForm)
