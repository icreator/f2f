// @flow
import React from 'react'
import { view } from 'react-easy-state'
import { Link } from 'react-router-dom'
import { i18n } from '../../state/i18n'
import state from '../../state/state'
import ExchangeForm from '../../components/ExchangeForm/ExchangeForm'
import Popup from '../../components/Popup/Popup'
import Button from '../../components/Button/Button'
import QRCode from '../../components/QRCode'
import Lightbox from '../../components/Lightbox/Lightbox'
import './ExchangePage.scss'
import { fetch } from 'whatwg-fetch'
import AbortController from '../../libs/abort-controller'
import Loader from '../../components/Loader'

type PropTypes = {||}
type StateTypes = {
  agreeToLicense: boolean,
  agreeToOrder: boolean,
  eraConfirm: boolean,
  inWallet: string,
  out_wallet: string,
  wrongWallet: boolean,
  validWallet: boolean,
  qrUri: string,
  copied: boolean,
  copiedText: string,
  addressLoading: boolean,
  addressInLoading: boolean,
  agreementsPopup: boolean,
  mayPayPopup: boolean,
  mayPay?: number,
  availableAmountIn?: number,
  availableAmountOut?: number,
  popup: boolean,
  order: boolean,
  computerPopup: boolean,
  phonePopup: boolean
}

const abortableFetch = ('signal' in new window.Request('')) ? window.fetch : fetch
const NewAbortController = ('AbortController' in window) ? window.AbortController : AbortController

class ExchangePage extends React.Component<PropTypes, StateTypes> {
  state = {
    agreeToLicense: false,
    agreeToOrder: false,
    eraConfirm: false,
    inWallet: '',
    out_wallet: '',
    wrongWallet: false,
    validWallet: false,
    qr: false,
    qrUri: '',
    copied: false,
    copiedText: 'exchange.accounts.wallet_copied',
    lightbox: false,
    addressLoading: false,
    addressInLoading: false,
    agreementsPopup: false,
    mayPayPopup: false,
    popup: false,
    order: false,
    computerPopup: false,
    phonePopup: false
  };
  container: { current: null | HTMLDivElement } = React.createRef();

  abortController: typeof NewAbortController

  onInput = (e: SyntheticEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    let signal
    if (value === '') {
      this.setState({
        wrongWallet: false,
        validWallet: false,
        out_wallet: value,
        inWallet: '',
        qrUri: ''
      })
      return
    }
    this.setState({
      wrongWallet: false,
      validWallet: false,
      addressLoading: true,
      out_wallet: value,
      inWallet: '',
      qrUri: ''
    })
    if (this.abortController !== undefined) {
      // $FlowFixMe
      this.abortController.abort()
    }
    if (!NewAbortController) {
      return
    }
    this.abortController = new NewAbortController()
    signal = this.abortController.signal
    return abortableFetch(`${state.serverName}/api/validate_addr.json/?addr=${value}`, {
      signal
    })
      .then(r => r.json())
      .then((r: { error?: string }) => {
        if (r.error) {
          this.setState({
            wrongWallet: true,
            addressLoading: false
          })
        } else {
          this.setState({
            validWallet: true,
            addressLoading: false
          })
        }
      }, (e: { name: string }) => {
        if (e.name !== 'AbortError') {
          this.setState({
            wrongWallet: false,
            validWallet: false
          })
          console.log(e)
        }
      })
  }

  copyToClipboard = (e, copiedText) => {
    if (e.currentTarget.value.length > 0) {
      e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
      document.execCommand('copy')
      e.currentTarget.setSelectionRange(0, 0)
      this.setState({
        copied: true,
        copiedText
      })
    }
  }

  validateCheckboxes = () => {
    if (state.calculator.tooLowIn || state.calculator.tooLowOut || state.calculator.exceeded || state.calculator.rateNotFound) {
      return false
    }
    // if (state.calculator.exceeded) {
    //   return this.state.agreeToOrder && this.state.agreeToLicense
    // }
    return this.state.agreeToLicense
  }

  validateAll = () => {
    if (!this.validateCheckboxes()) {
      this.setState({
        agreementsPopup: true
      })
      return
    }
    this.checkMayPay()
  }

  checkMayPay = () => {
    const { in: currIn, amountIn } = state.calculator
    const mayPay = state.getMayPay(currIn.id)
    if (mayPay) {
      if (parseFloat(amountIn) > mayPay) {
        this.setState({
          mayPayPopup: true,
          mayPay
        })
        return
      }
    }
    this.checkExceeded()
  }

  checkExceeded = () => {
    const { amountOut, out: currOut } = state.calculator
    const amountOutNum = parseFloat(amountOut)
    let availableAmountOut = state.getAvailableAmount(currOut.id)
    if (!availableAmountOut) {
      availableAmountOut = 0
    }
    if (amountOutNum > availableAmountOut) {
      this.setState({
        popup: true,
        availableAmountOut
      })
      state.calculator.exceeded = true
    } else {
      this.getInWallet()
    }
  }

  getInWallet = () => {
    this.setState({
      addressInLoading: true,
      inWallet: '',
      qrUri: ''
    })
    fetch(`${state.serverName}/apipay/get_uri.json/2/${state.calculator.in.id}/${state.calculator.out.id}/${this.state.out_wallet}/${state.calculator.amountOut}`)
      .then(r => r.json())
      .then(({
        addr_in: inWallet,
        uri: qrUri,
        error
      }: {
        addr_in: string, // eslint-disable-line react/no-unused-prop-types
        uri: string, // eslint-disable-line react/no-unused-prop-types
        error?: string // eslint-disable-line react/no-unused-prop-types
      }) => {
        if (error) {
          if (/address not valid/.exec(error)) {
            this.setState({
              addressInLoading: false,
              validWallet: false,
              wrongWallet: true
            })
          } else {
            throw (error)
          }
        } else {
          this.setState({
            addressInLoading: false,
            inWallet,
            qrUri
          })
        }
      })
  }

  resetForm = () => {
    this.setState({
      out_wallet: '',
      inWallet: '',
      qrUri: '',
      wrongWallet: false,
      validWallet: false,
      agreeToOrder: false,
      agreeToLicense: false,
      eraConfirm: false,
      popup: false,
      mayPayPopup: false
    })
  }

  render () {
    let header = i18n.t('exchange.header.exchange')
    let { rate } = state.calculator
    if (!rate) {
      rate = 0
    }
    let rateInfo = <span key='line1'>
      <span className='bold'>{[i18n.t('exchange.rateInfo.rate'), ':']}</span>
      {
        // eslint-disable-next-line eqeqeq
        ` ${parseFloat(state.calculator.amountIn) == 0 ? 0 : 1} ${state.calculator.in.code} = ${rate.toFixed(8)} ${state.calculator.out.code}`}
      {/* <span className="bold">{` ${i18n.t('exchange.rateInfo.commission')}:`}</span> */}
      {/* {` ${this.state.commission} ${state.calculator.out.code}`} */}
    </span>
    const checkboxes = [
      <div className='checkbox-row' key='license-agreements'>
        <div
          className={'checkbox' + (this.state.agreeToLicense ? ' active' : '')}
          onClick={() => this.setState({
            agreeToLicense: !this.state.agreeToLicense
          })}
        />
        <label
          onClick={() => this.setState({
            agreeToLicense: !this.state.agreeToLicense
          })}
        >{i18n.t('exchange.checkboxes.licenses', {
          // $FlowFixMe
          privacy_policy_link: <a
            key='privacy_policy'
            href={`/locales/${i18n.lang}/privacy_policy.pdf`}
            target='_blank'
            onClick={(e: Event) => e.stopPropagation()}
          >
            {i18n.t('exchange.checkboxes.privacy_policy_link')}
          </a>,
          // $FlowFixMe
          terms_of_use_link: <a
            key='terms_of_use'
            href={`/locales/${i18n.lang}/terms_of_use.pdf`}
            target='_blank'
            onClick={(e: Event) => e.stopPropagation()}
          >
            {i18n.t('exchange.checkboxes.terms_of_use_link')}
          </a>
        })}</label>
      </div>
    ]

    /** Раскомментируй, чтобы включить страницу обмена */
    /* if (state.calculator.exceeded) {
      header = i18n.t('exchange.header.order')
      let availableAmountOut = state.getAvailableAmount(state.calculator.out.id)
      if (!availableAmountOut) {
        availableAmountOut = 0
      }
      rateInfo = [
        rateInfo,
        <br key='br' />,
        <span key='line2'>
          <span className='bold'>{[i18n.t('exchange.rateInfo.available'), ':']}</span>
          {` ${availableAmountOut} ${state.calculator.out.code}, `}
          <span className='bold'>{[i18n.t('exchange.rateInfo.debt'), ':']}</span>
          {` ${state.calculator.amountOut - availableAmountOut} ${state.calculator.out.code}`}
        </span>,
        <br key='br2' />,
        <span key='line3'>
          <span className='bold'>{i18n.t('exchange.rateInfo.debt2')}</span>
        </span>
      ]
      checkboxes.unshift(<div className='row' key='order-agreements'>
        <div
          className={'checkbox' + (this.state.agreeToOrder ? ' active' : '')}
          onClick={() => this.setState({
            agreeToOrder: !this.state.agreeToOrder
          })}
        />
        <label
          onClick={() => this.setState({
            agreeToOrder: !this.state.agreeToOrder
          })}
        >{i18n.t('exchange.checkboxes.order')}</label>
      </div>)
    } */

    const checkboxesValid = this.validateCheckboxes()
    const isErachain = state.calculator.in.system && ['erachain'].includes(state.calculator.in.system)
    let stepNumber = 0

    return <div className='exchange-page'>
      <div className='container-950'>
        <h1>{header}</h1>
        <ExchangeForm onChange={this.resetForm} />
        <div className='rate-info'>
          {rateInfo}
        </div>
        <div className='acceptance-checkboxes'>
          {checkboxes}
        </div>
        {/* Ввод номера счёта для получения валюты */}
        {checkboxesValid && <div className='exchange-section'>
          <span className='step-number'>{++stepNumber}</span>
          <div>
            <h3>{i18n.t('exchange.accounts.out_label', {
              currency: state.calculator.out.code
            })}</h3>
            <div>
              <input className={`account-out-input ${(this.state.wrongWallet) ? 'error' : ''}`} onChange={() => { }} value={this.state.out_wallet} onInput={this.onInput} />
            </div>
            {this.state.wrongWallet && <span className='account-out-error'>{i18n.t('exchange.accounts.wrong_account')}</span>}
            {(parseFloat(state.calculator.amountOut) === 0 || isNaN(parseFloat(state.calculator.amountOut))) && <span className='account-out-error'>{i18n.t('exchange.accounts.null_amount')}</span>}
            {this.state.validWallet && parseFloat(state.calculator.amountOut) > 0 && !this.state.addressInLoading && this.state.inWallet === '' && <div className='nextButton'><button className='btn' onClick={this.validateAll}>{i18n.t('exchange.accounts.next')}</button></div>}
            {(this.state.addressInLoading || this.state.addressLoading) && <div className='nextButton'><Loader /></div>}
          </div>
        </div>}
        {/* Предупреждение ERACHAIN */}
        {isErachain && this.state.inWallet !== '' && <div className='exchange-section'>
          <span className='step-number'>{++stepNumber}</span>
          <div className='era-warning'>
            <div className='erachain-warning-left'>
              <h3>{i18n.t('exchange.era_warning.header')}</h3>
              <p>
                {i18n.t('exchange.era_warning.text', {
                  currency: state.calculator.out.code,
                  // $FlowFixMe
                  br: <br />
                })}
              </p>
              <input title={i18n.t('exchange.era_warning.click_to_copy')} value={`${state.calculator.out.code}:${this.state.out_wallet}`} readOnly onClick={(e: SyntheticEvent<HTMLInputElement>) => this.copyToClipboard(e, 'exchange.era_warning.wallet_copied')} />
            </div>
            <div className='erachain-warning-right'>
              <h3>{i18n.t('exchange.era_warning.how_to_header')}</h3>
              <div className='row'>
                <div className='erachain-warning-how-to-item-container'>
                  <div onClick={() => this.setState({
                    computerPopup: true
                  })}>
                    <img src='/img/desktop-solid.svg' />
                    <span>{i18n.t('exchange.era_warning.how_to_pc')}</span>
                  </div>
                </div>
                <div className='erachain-warning-how-to-item-container'>
                  <div onClick={() => this.setState({
                    phonePopup: true
                  })}>
                    <img src='/img/mobile-alt-solid.svg' />
                    <span>{i18n.t('exchange.era_warning.how_to_phone')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='checkbox-row'>
              <div
                className={'checkbox' + (this.state.eraConfirm ? ' active' : '')}
                onClick={() => this.setState({
                  eraConfirm: !this.state.eraConfirm
                })}
              />
              <label
                onClick={() => this.setState({
                  eraConfirm: !this.state.eraConfirm
                })}
              >{i18n.t('exchange.era_warning.confirmation')}</label>
            </div>
          </div>
        </div>}
        {/* Кошелёк длдя перевода, QR-код и прочие радости жизни */}
        {this.state.inWallet !== '' && (!isErachain || this.state.eraConfirm) && <div className='exchange-section'>
          <span className='step-number'>{++stepNumber}</span>
          <div>
            <h3>{i18n.t('exchange.accounts.in_label', {
              currency: state.calculator.in.code
            })}</h3>
            <input title={i18n.t('exchange.accounts.click_to_copy')} className='account-in-input' readOnly onClick={(e: SyntheticEvent<HTMLInputElement>) => this.copyToClipboard(e, 'exchange.accounts.wallet_copied')} value={this.state.inWallet} />
            <div className='QR-code'>
              <QRCode
                logo={`${state.serverName}${state.icon_url}/${state.calculator.in.icon}`}
                value={`${this.state.qrUri}`}
              />
            </div>
            <div className='ta-center'>
              <p>
                {[
                  this.state.order && <span>{i18n.t('exchange.success.message[0]')}<br /></span>,
                  i18n.t('exchange.success.message[1]')
                ]}
              </p>
              <hr className='short-hr' />
              <p>
                {i18n.t('exchange.success.message[2]')}
              </p>
              <Link to={`/payments/${state.calculator.out.code}/${this.state.out_wallet}`} className='btn'>{i18n.t('exchange.success.payments_button')}</Link>
            </div>
          </div>
        </div>}
      </div>
      <Popup
        open={this.state.copied}
        close={() => this.setState({ copied: !this.state.copied })}
      >
        <h1>{i18n.t(this.state.copiedText)}</h1>
        <Button onClick={() => this.setState({ copied: !this.state.copied })}>{i18n.t('ok')}</Button>
      </Popup>
      <Lightbox
        open={this.state.computerPopup}
        close={() => this.setState({ computerPopup: false })}
        content={[
          `/locales/${i18n.lang}/img/era-node-guide.png`
        ]}
      />
      <Lightbox
        open={this.state.phonePopup}
        close={() => this.setState({ phonePopup: false })}
        content={[
          `/locales/${i18n.lang}/img/era-mobile-guide.png`
        ]}
      />
      <Popup
        open={this.state.agreementsPopup}
        close={() => this.setState({ agreementsPopup: false })}
      >
        <h1>{i18n.t('exchange.agreementsPopup.header')}</h1>
        <Button onClick={() => this.setState({ agreementsPopup: !this.state.agreementsPopup })}>{i18n.t('ok')}</Button>
      </Popup>
      <Popup
        open={this.state.popup}
        close={() => {
          state.calculator = {
            ...state.calculator,
            amountIn: '0',
            amountOut: '0',
            usdValue: 0,
            rate: 0,
            exceeded: false,
            tooLowIn: false,
            tooLowOut: false
          }
          this.resetForm()
        }}
      >
        <h1>{i18n.t('limitExceededPopup.header', { currency: state.calculator.out.name })}</h1>
        <p>{i18n.t('limitExceededPopup.text1', {
          currencyIn: state.calculator.in.code,
          currencyOut: state.calculator.out.code,
          availableAmountIn: (this.state.availableAmountIn ? `${this.state.availableAmountIn}` : '0'),
          availableAmountOut: (this.state.availableAmountOut ? `${this.state.availableAmountOut}` : '0')
        })}</p>
        <Button onClick={() => {
          state.calculator = {
            ...state.calculator,
            amountIn: '0',
            amountOut: '0',
            usdValue: 0,
            rate: 0,
            exceeded: false,
            tooLowIn: false,
            tooLowOut: false
          }
          this.resetForm()
        }}>{i18n.t('continue')}</Button>
      </Popup>
      <Popup
        open={this.state.mayPayPopup}
        close={() => {
          state.calculator = {
            ...state.calculator,
            amountIn: '0',
            amountOut: '0',
            usdValue: 0,
            rate: 0,
            exceeded: false,
            tooLowIn: false,
            tooLowOut: false
          }
          this.resetForm()
        }}
      >
        <h1>{i18n.t('maypayExceededPopup.header', { currency: state.calculator.in.name })}</h1>
        <p>{i18n.t('maypayExceededPopup.text1', {
          currencyIn: state.calculator.in.code,
          mayPay: (this.state.mayPay ? `${this.state.mayPay}` : '0')
        })}</p>
        <Button onClick={() => {
          state.calculator = {
            ...state.calculator,
            amountIn: '0',
            amountOut: '0',
            usdValue: 0,
            rate: 0,
            exceeded: false,
            tooLowIn: false,
            tooLowOut: false
          }
          this.resetForm()
        }}>{i18n.t('continue')}</Button>
      </Popup>
    </div>
  }
}

export default view(ExchangePage)
