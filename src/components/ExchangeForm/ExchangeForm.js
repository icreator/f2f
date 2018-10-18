// @flow
import React from 'react'
import { i18n } from '../../state/i18n'
import state from '../../state/state'
import { fetch } from 'whatwg-fetch'
import { view } from 'react-easy-state'
import AbortController from '../../libs/abort-controller'
import CurrencySelector from '../CurrencySelector/CurrencySelector'
import './ExchangeForm.scss'
import CurrencyInput from '../CurrencyInput/CurrencyInput'

type PropTypes = {|
  onChange: () => void
|}
type StateTypes = {|
  rate: string,
  lastInput: string,
  in_loading: boolean,
  out_loading: boolean,
  out_error: boolean,
  tooLowIn: boolean,
  tooLowOut: boolean
|}

const abortableFetch = ('signal' in new window.Request('')) ? window.fetch : fetch
const NewAbortController = ('AbortController' in window) ? window.AbortController : AbortController

class ExchangeForm extends React.Component<PropTypes, StateTypes> {
  state = {
    rate: '',
    lastInput: 'in',
    in_loading: false,
    out_loading: false,
    out_error: false,
    tooLowIn: false,
    tooLowOut: false
  }

  abortController: typeof abortableFetch

  constructor (props: PropTypes) {
    super(props)
    if (state.calculator.in.name === '') {
      state.calculator.in = state.currencies.in.COMPU
    }
    if (state.calculator.out.name === '') {
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
    let availableAmountOut = state.getAvailableAmount(currOutId)
    this.loadRate(currInId, currOutId, amountIn)
      .then(({ volume_out: amountOut, rate }) => {
        let exceeded = false
        let tooLowOut = false
        if (!availableAmountOut) {
          availableAmountOut = 0
        }
        if (amountOut > availableAmountOut) {
          exceeded = true
        }
        let newAmountOut = amountOut
        if (amountOut < 0) {
          newAmountOut = 0.0
          tooLowOut = true
        }
        state.calculator = {
          ...state.calculator,
          amountOut: newAmountOut,
          rate,
          exceeded
        }
        this.setState({
          out_loading: false,
          tooLowOut
        })
      }, (e: { name: string }) => {
        if (e.name !== 'AbortError') {
          this.setState({
            out_error: true
          })
          console.log(e)
        }
      })
  };

  setInAmount = (event: SyntheticEvent<HTMLInputElement>) => {
    const amountIn = event.currentTarget.value
    let tooLowIn = false
    const { in: currIn, out: currOut } = state.calculator
    let amountInNum = parseFloat(amountIn)
    if (isNaN(amountInNum)) {
      amountInNum = 0
    }
    if (state.calculator.in.min) {
      if (amountInNum < state.calculator.in.min) {
        amountInNum = 0
        tooLowIn = true
      }
    }
    state.calculator = {
      ...state.calculator,
      amountIn,
      usdValue: amountInNum * state.getRate('usd', currIn.code)
    }
    if (!tooLowIn) {
      this.setState({
        tooLowIn
      })
      this.recalculateOutAmount(currIn.id, currOut.id, amountInNum)
    } else {
      if (this.abortController !== undefined) {
        this.abortController.abort()
      }
      this.setState({
        tooLowIn,
        out_loading: false,
        out_error: false
      })
      state.calculator = {
        ...state.calculator,
        amountOut: 0,
        rate: 0
      }
    }
  };

  setOutAmount = (event) => {
  };

  setIn = (currIn: {
    id: number,
    name: string,
    code: string,
    icon: string,
    min?: number
  }) => {
    const { out, amountIn } = state.calculator
    let amountInNum = parseFloat(amountIn)
    let tooLowIn = false
    if (isNaN(amountInNum)) {
      amountInNum = 0
    }
    if (currIn.min) {
      if (amountInNum < currIn.min) {
        amountInNum = 0
        tooLowIn = true
      }
    }
    state.calculator = {
      ...state.calculator,
      in: currIn,
      usdValue: amountInNum * state.getRate('usd', currIn.code)
    }
    this.setState({
      tooLowIn
    })
    if (!tooLowIn) {
      this.recalculateOutAmount(currIn.id, out.id, amountInNum)
    } else {
      if (this.abortController !== undefined) {
        this.abortController.abort()
      }
      state.calculator = {
        ...state.calculator,
        amountOut: 0,
        rate: 0
      }
    }
  };

  setOut = (out: {
    id: number,
    name: string,
    icon: string,
    code: string,
    min?: number
  }) => {
    const { in: currIn, amountIn } = state.calculator
    let amountInNum = parseFloat(amountIn)
    if (isNaN(amountInNum)) {
      amountInNum = 0
    }
    state.calculator = {
      ...state.calculator,
      out
    }
    this.recalculateOutAmount(currIn.id, out.id, amountInNum)
  };

  swap = () => {
    const { in: out, out: currIn, amountOut: amountIn } = state.calculator
    state.calculator = {
      ...state.calculator,
      in: currIn,
      out,
      amountIn: `${amountIn}`,
      usdValue: amountIn * state.getRate('usd', currIn.code)
    }
    this.recalculateOutAmount(currIn.id, out.id, amountIn)
  };

  loadRate: (currIn: number, currOut: number, amount: number) => Promise<{
    volume_out: number,
    rate: number
  }> = (currIn, currOut, amount) => {
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
    if (typeof NewAbortController !== 'function') {
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

    let intl = i18n.t('intl')

    if (typeof intl !== 'string') {
      intl = 'en-US'
    }

    return <div className='exchange-form'>
      <div className='column'>
        <CurrencySelector value={currIn} onChange={this.setIn} data={state.currencies.in} />
        <label>{i18n.t('calculator.exchange')}</label>
        <CurrencyInput value={amountIn} onInput={this.setInAmount} loading={this.state.in_loading} error={false} />
        <div className='in-usd'>
          {(this.state.tooLowIn && state.calculator.in.min)
            ? <span style={{ color: 'red' }}>{i18n.t('calculator.tooLowInput', {
              min: `${state.calculator.in.min}`
            })}</span>
            : [
              <span>${usdValue.toLocaleString(intl, {
                minimumFractionDigits: 2
              })}</span>,
              <span>USD</span>
            ]
          }
        </div>
      </div>
      <div className='swap-container'>
        <a onClick={this.swap}>{i18n.t('calculator.swap')}</a>
      </div>
      <div className='column'>
        <CurrencySelector value={currOut} onChange={this.setOut} data={state.currencies.out} />
        <label>{i18n.t('calculator.receive')}</label>
        <CurrencyInput
          value={`${amountOut}`}
          onInput={this.setOutAmount}
          loading={this.state.out_loading}
          error={this.state.out_error}
        />
        <div className='in-usd'>
          {this.state.tooLowOut
            ? <span style={{ color: 'red' }}>{i18n.t('calculator.tooLowOut')}</span>
            : [
              <span>{i18n.t('calculator.rate')}</span>,
              <span>{rate.toFixed(8)}</span>
            ]
          }
        </div>
      </div>
    </div>
  }
}

export default view(ExchangeForm)
