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

type PropTypes = {||}
type StateTypes = {
  agreeToLicense: boolean,
  agreeToOrder: boolean,
  headerSize: number,
  textSize: number,
  inWallet: string,
  out_wallet: string,
  wrongWallet: boolean,
  validWallet: boolean,
  qr: boolean,
  qrUri: string,
  copied: boolean,
  copiedText: string,
  lightbox: boolean,
  addressLoading: boolean,
  addressInLoading: boolean,
  agreementsPopup: boolean,
  mayPayPopup: boolean,
  mayPay?: number,
  availableAmountIn?: number,
  availableAmountOut?: number,
  popup: boolean,
  order: boolean
}

const abortableFetch = ('signal' in new window.Request('')) ? window.fetch : fetch
const NewAbortController = ('AbortController' in window) ? window.AbortController : AbortController

class ExchangePage extends React.Component<PropTypes, StateTypes> {
  state = {
    agreeToLicense: false,
    agreeToOrder: false,
    headerSize: 116.25,
    textSize: 16,
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
    order: false
  };
  container: { current: null | HTMLDivElement } = React.createRef();

  abortController: typeof NewAbortController

  componentDidMount () {
    this.resizeText()
    window.addEventListener('resize', this.resizeText)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeText)
  }

  resizeText = () => {
    if (!this.container.current) {
      return
    }
    const percentage = this.container.current.offsetHeight / 471
    const headerSize = 116.25 * percentage
    const textSize = 16 * percentage

    this.setState({
      headerSize,
      textSize
    })
  };

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
    return abortableFetch(`${state.serverName}/api/validate_addr.json/${value}`, {
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
    if (state.calculator.exceeded) {
      return this.state.agreeToOrder && this.state.agreeToLicense
    }
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
    let availableAmountOut = state.getAvailableAmount(currOut.id)
    if (!availableAmountOut) {
      availableAmountOut = 0
    }
    if (amountOut > availableAmountOut) {
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
      agreeToLicense: false
    })
  }

  render () {
    const style = <style>
      {`
      .accounts-box .section-name {
        font-size: ${this.state.headerSize}px;
      }
      .accounts-box .accounts-fg,
      .accounts-box .accounts-fg input,
      .accounts-box .accounts-fg button {
        font-size: ${this.state.textSize}px;
      }
      `}
    </style>
    let header = i18n.t('exchange.header.exchange')
    let rateInfo = <span key='line1'>
      <span className='bold'>{[i18n.t('exchange.rateInfo.rate'), ':']}</span>
      {
        // eslint-disable-next-line eqeqeq
        ` ${parseFloat(state.calculator.amountIn) == 0 ? 0 : 1} ${state.calculator.in.code} = ${state.calculator.rate} ${state.calculator.out.code}`}
      {/* <span className="bold">{` ${i18n.t('exchange.rateInfo.commission')}:`}</span> */}
      {/* {` ${this.state.commission} ${state.calculator.out.code}`} */}
    </span>
    const checkboxes = [
      <div className='row' key='license-agreements'>
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

    if (state.calculator.exceeded) {
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
    }

    const checkboxesValid = this.validateCheckboxes()

    return <div className='exchange-page'>
      {style}
      <div className='container-950'>
        <h1>{header}</h1>
        <ExchangeForm onChange={this.resetForm} />
        <div className='rate-info'>
          {rateInfo}
        </div>
        <div className='acceptance-checkboxes'>
          {checkboxes}
        </div>
      </div>
      <div className='accounts-box' ref={this.container}>
        <h2 className='section-name'>{i18n.t('exchange.accounts.header')}</h2>
        <div className='accounts-fg'>
          {checkboxesValid && <span className='account-out-label'>{i18n.t('exchange.accounts.out_label', { currency: state.calculator.out.code })}</span>}
          {<input className={`account-out-input`} disabled={!checkboxesValid} onChange={() => {}} value={this.state.out_wallet} onInput={this.onInput} />}
          {this.state.wrongWallet && <span className='account-out-error'>{i18n.t('exchange.accounts.wrong_account')}</span>}
          {this.state.addressLoading && <div className='next-btn'><div className='address-loader' /></div>}
          {(this.state.validWallet && state.calculator.amountOut > 0) && <button className='next-btn' onClick={this.validateAll}>{i18n.t('exchange.accounts.next')}</button>}
          {this.state.inWallet !== '' && <span className='account-in-label'>{i18n.t('exchange.accounts.in_label', { currency: state.calculator.in.code })}</span>}
          <input title={i18n.t('exchange.accounts.click_to_copy')} className='account-in-input' readOnly onClick={(e: SyntheticEvent<HTMLInputElement>) => this.copyToClipboard(e, 'exchange.accounts.wallet_copied')} value={this.state.inWallet} />
          {(this.state.inWallet !== '' && this.state.qrUri !== '') && <button className='qr-code-btn' onClick={() => this.setState({
            qr: true
          })}>{i18n.t('exchange.accounts.qr_code')}</button>}
          {this.state.addressInLoading && <div className='qr-code-btn'><div className='address-loader' /></div>}
        </div>
      </div>
      {(this.state.inWallet && ['ERA', 'COMPU'].includes(state.calculator.in.code)) && <div className='era-warning'>
        <div className='container-950'>
          <h1>{i18n.t('exchange.era_warning.header')}</h1>
          <div className='right-part'>
            <span>{i18n.t('exchange.era_warning.text')}</span>
            <div>
              <input title={i18n.t('exchange.era_warning.click_to_copy')} value={`${state.calculator.out.code}:${this.state.out_wallet}`} readOnly onClick={(e: SyntheticEvent<HTMLInputElement>) => this.copyToClipboard(e, 'exchange.era_warning.wallet_copied')} />
              <button className='question-mark-btn' onClick={() => this.setState({ lightbox: true })} />
            </div>
          </div>
        </div>
      </div>}
      {this.state.inWallet && <div className='container-950 ta-center'>
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
      </div>}
      <Popup
        open={this.state.qr}
        close={() => this.setState({ qr: !this.state.qr })}
      >
        <QRCode
          logo={`${state.serverName}${state.icon_url}/${state.calculator.in.icon}`}
          value={`${this.state.qrUri}`}
        />
      </Popup>
      <Popup
        open={this.state.copied}
        close={() => this.setState({ copied: !this.state.copied })}
      >
        <h1>{i18n.t(this.state.copiedText)}</h1>
        <Button onClick={() => this.setState({ copied: !this.state.copied })}>{i18n.t('ok')}</Button>
      </Popup>
      <Lightbox
        open={this.state.lightbox}
        close={() => this.setState({ lightbox: !this.state.lightbox })}
        content={[
          `/locales/${i18n.lang}/img/era-node-guide.png`,
          `/locales/${i18n.lang}/img/era-mobile-guide.png`
        ]}
      />
      <Popup
        open={this.state.agreementsPopup}
        close={() => this.setState({ agreementsPopup: !this.state.agreementsPopup })}
      >
        <h1>{i18n.t('exchange.agreementsPopup.header')}</h1>
        <Button onClick={() => this.setState({ agreementsPopup: !this.state.agreementsPopup })}>{i18n.t('ok')}</Button>
      </Popup>
      <Popup
        open={this.state.popup}
        close={() => this.setState({ popup: !this.state.popup })}
      >
        <h1>{i18n.t('limitExceededPopup.header', { currency: state.calculator.out.name })}</h1>
        <p>{i18n.t('limitExceededPopup.text1', {
          currencyIn: state.calculator.in.code,
          currencyOut: state.calculator.out.code,
          availableAmountIn: (this.state.availableAmountIn ? `${this.state.availableAmountIn}` : '0'),
          availableAmountOut: (this.state.availableAmountOut ? `${this.state.availableAmountOut}` : '0')
        })}</p>
        <p>{i18n.t('limitExceededPopup.text2')}</p>
        <Button onClick={() => {
          this.setState({
            popup: false
          })
          this.getInWallet()
        }}>{i18n.t('continue')}</Button>
      </Popup>
      <Popup
        open={this.state.mayPayPopup}
        close={() => this.setState({ mayPayPopup: !this.state.mayPayPopup })}
      >
        <h1>{i18n.t('maypayExceededPopup.header', { currency: state.calculator.in.name })}</h1>
        <p>{i18n.t('maypayExceededPopup.text1', {
          currencyIn: state.calculator.in.code,
          mayPay: (this.state.mayPay ? `${this.state.mayPay}` : '0')
        })}</p>
        <p>{i18n.t('maypayExceededPopup.text2', {
          currencyIn: state.calculator.in.code,
          currencyOut: state.calculator.out.code
        })}</p>
        <Button onClick={() => {
          this.setState({
            mayPayPopup: false
          })
          this.checkExceeded()
        }}>{i18n.t('continue')}</Button>
      </Popup>
    </div>
  }
}

export default view(ExchangePage)
