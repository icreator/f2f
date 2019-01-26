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
  out_error: boolean,
  in_error: boolean
|}

const abortableFetch = ('signal' in new window.Request('')) ? window.fetch : fetch
const NewAbortController = ('AbortController' in window) ? window.AbortController : AbortController

class ExchangeForm extends React.Component<PropTypes, StateTypes> {
  state = {
    rate: '',
    out_error: false,
    in_error: false
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
    state.calculator.lastInput = 'in'
    this.setState({
      out_error: false
    })
    state.calculator.out_loading = true
    if (typeof this.props.onChange === 'function') {
      this.props.onChange()
    }
    let availableAmountOut = state.getAvailableAmount(currOutId)
    const amountInNum = parseFloat(amountIn)
    this.loadRate(currInId, currOutId, amountInNum)
      .then(({ volume_out: amountOut, rate }) => {
        let exceeded = false
        let tooLowOut = false
        let rateNotFound = false
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
        if (!amountOut) {
          newAmountOut = 0.0
          rateNotFound = true
        }
        state.calculator = {
          ...state.calculator,
          amountOut: `${newAmountOut}`,
          rate,
          exceeded,
          tooLowOut,
          rateNotFound,
          out_loading: false
        }
      }, (e: { name: string }) => {
        if (e.name !== 'AbortError') {
          this.setState({
            out_error: true
          })
          console.log(e)
        }
      })
  };

  recalculateInAmount = (currInId, currOutId, amountOut) => {
    state.calculator.lastInput = 'out'
    this.setState({
      in_error: false
    })
    state.calculator.in_loading = true
    if (typeof this.props.onChange === 'function') {
      this.props.onChange()
    }
    this.loadRate(currInId, currOutId, amountOut, true)
      .then(({ volume_out: amountIn, rate }) => {
        let tooLowIn = false
        let newAmountIn = amountIn
        if (state.calculator.in.min) {
          if (amountIn < state.calculator.in.min) {
            tooLowIn = true
          }
        }
        state.calculator = {
          ...state.calculator,
          amountIn: `${newAmountIn}`,
          rate,
          tooLowIn,
          in_loading: false
        }
      }, (e: { name: string }) => {
        if (e.name !== 'AbortError') {
          this.setState({
            in_error: true
          })
          console.log(e)
        }
      })
  }

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
      usdValue: amountInNum * state.getRate('usd', currIn.code),
      tooLowIn
    }
    if (!tooLowIn) {
      this.recalculateOutAmount(currIn.id, currOut.id, amountInNum)
    } else {
      if (this.abortController !== undefined) {
        this.abortController.abort()
      }
      this.setState({
        out_error: false
      })
      state.calculator = {
        ...state.calculator,
        out_loading: false,
        amountOut: '0',
        rate: 0,
        exceeded: false
      }
    }
  };

  setOutAmount = (event: SyntheticEvent<HTMLInputElement>) => {
    const amountOut = event.currentTarget.value
    let tooLowOut = false
    let exceeded = false
    const { in: currIn, out: currOut } = state.calculator
    let amountOutNum = parseFloat(amountOut)
    if (isNaN(amountOutNum)) {
      amountOutNum = 0
    }
    if (state.calculator.out.min) {
      if (amountOutNum < state.calculator.out.min) {
        amountOutNum = 0
        tooLowOut = true
      }
    }
    let availableAmount = state.getAvailableAmount(currOut.id)
    if (!availableAmount) {
      availableAmount = 0
    }
    if (amountOutNum > availableAmount) {
      exceeded = true
    }
    state.calculator = {
      ...state.calculator,
      amountOut: amountOut,
      usdValue: amountOutNum * state.getRate('usd', currOut.code),
      exceeded,
      tooLowOut
    }
    if (!tooLowOut) {
      this.recalculateInAmount(currIn.id, currOut.id, amountOutNum)
    } else {
      if (this.abortController !== undefined) {
        this.abortController.abort()
      }
      this.setState({
        in_error: false
      })
      state.calculator = {
        ...state.calculator,
        in_loading: false,
        amountIn: '0',
        rate: 0,
        exceeded: false
      }
    }
  };

  setIn = (currIn: {
    id: number,
    name: string,
    code: string,
    icon: string,
    min?: number,
    system?: string
  }) => {
    if (state.calculator.lastInput === 'in') {
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
        usdValue: amountInNum * state.getRate('usd', currIn.code),
        tooLowIn
      }
      if (!tooLowIn) {
        this.recalculateOutAmount(currIn.id, out.id, amountInNum)
      } else {
        if (this.abortController !== undefined) {
          this.abortController.abort()
        }
        this.setState({
          out_error: false
        })
        state.calculator = {
          ...state.calculator,
          amountOut: '0',
          rate: 0,
          exceeded: false,
          out_loading: false
        }
      }
    } else {
      const { out, amountOut } = state.calculator
      let amountOutNum = parseFloat(amountOut)
      if (isNaN(amountOutNum)) {
        amountOutNum = 0
      }
      state.calculator = {
        ...state.calculator,
        in: currIn
      }
      this.recalculateInAmount(currIn.id, out.id, amountOutNum)
    }
  };

  setOut = (out: {
    id: number,
    name: string,
    icon: string,
    code: string,
    min?: number,
    system?: string
  }) => {
    if (state.calculator.lastInput === 'in') {
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
    } else {
      const { in: currIn, amountOut } = state.calculator
      let amountOutNum = parseFloat(amountOut)
      let exceeded = false
      let tooLowOut = false
      if (isNaN(amountOutNum)) {
        amountOutNum = 0
      }
      let availableAmountOut = state.getAvailableAmount(out.id)
      if (!availableAmountOut) {
        availableAmountOut = 0
      }
      if (amountOutNum > availableAmountOut) {
        exceeded = true
      }
      if (amountOutNum < 0) {
        tooLowOut = true
      }
      state.calculator = {
        ...state.calculator,
        out,
        exceeded,
        tooLowOut
      }
      if (!tooLowOut) {
        this.recalculateInAmount(currIn.id, out.id, amountOutNum)
      } else {
        if (this.abortController !== undefined) {
          this.abortController.abort()
        }
        this.setState({
          in_error: false
        })
        state.calculator = {
          ...state.calculator,
          amountIn: '0',
          rate: 0,
          exceeded: false,
          tooLowIn: false,
          in_loading: false
        }
      }
    }
  };

  swap = () => {
    const { in: out, out: currIn, amountOut: amountIn } = state.calculator
    const amountInNum = parseFloat(amountIn)
    let tooLowIn = false
    if (currIn.min) {
      if (amountInNum < currIn.min) {
        tooLowIn = false
      }
    }
    state.calculator = {
      ...state.calculator,
      in: currIn,
      out,
      amountIn: `${amountIn}`,
      usdValue: amountInNum * state.getRate('usd', currIn.code),
      tooLowIn,
      tooLowOut: false
    }
    if (!tooLowIn) {
      this.recalculateOutAmount(currIn.id, out.id, amountIn)
    } else {
      if (this.abortController !== undefined) {
        this.abortController.abort()
      }
      this.setState({
        out_error: false
      })
      state.calculator = {
        ...state.calculator,
        amountOut: '0',
        rate: 0,
        exceeded: false,
        out_loading: false
      }
    }
  };

  loadRate: (currIn: number, currOut: number, amount: number, calcOut?: boolean) => Promise<{
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
      usdValue
    } = state.calculator
    let {
      rate
    } = state.calculator

    if (!rate) {
      rate = 0
    }

    let intl = i18n.t('intl')

    if (typeof intl !== 'string') {
      intl = 'en-US'
    }

    const availableAmount = state.getAvailableAmount(state.calculator.out.id)

    return <div className='exchange-form'>
      <div className='column'>
        <CurrencySelector value={currIn} onChange={this.setIn} data={state.currencies.in} />
        <label>{i18n.t('calculator.exchange')}</label>
        <CurrencyInput
          value={amountIn}
          onInput={this.setInAmount}
          loading={state.calculator.in_loading}
          error={this.state.in_error}
        />
        <div className='in-usd'>
          {(state.calculator.tooLowIn && state.calculator.in.min)
            ? <span style={{ color: 'red' }}>{i18n.t('calculator.tooLowInput', {
              min: `${state.calculator.in.min}`,
              curr: state.calculator.in.code
            })}</span>
            : [
              <span key='value'>${usdValue.toLocaleString(intl, {
                minimumFractionDigits: 2
              })}</span>,
              <span key='usd'>USD</span>
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
          // onInput={this.setOutAmount}
          onInput={() => undefined}
          loading={state.calculator.out_loading}
          error={this.state.out_error}
        />
        <div className='in-usd'>
          {state.calculator.tooLowOut
            ? <span style={{ color: 'red' }}>{i18n.t('calculator.tooLowOut')}</span>
            : state.calculator.exceeded
              ? <span style={{ color: 'red' }}>{i18n.t('calculator.exceeded', {
                amount: availableAmount ? `${availableAmount}` : '0',
                curr: state.calculator.out.code
              })}</span>
              : state.calculator.rateNotFound
                ? <span style={{ color: 'red' }}>{i18n.t('calculator.rateNotFound')}</span>
                : [
                  <span key='string'>{i18n.t('calculator.rate')}</span>,
                  <span key='rate'>{rate.toFixed(8)}</span>
                ]
          }
        </div>
      </div>
    </div>
  }
}

export default view(ExchangeForm)
