import React from 'react';
import {view} from 'react-easy-state';
import {Link} from "react-router-dom";
import {i18n} from "../../state/i18n";
import state from '../../state/state';
import ExchangeForm from "../../components/ExchangeForm/ExchangeForm";
import Popup from "../../components/Popup/Popup";
import Button from "../../components/Button/Button";
import QRCode from "../../components/QRCode";
import Lightbox from "../../components/Lightbox/Lightbox";
import './ExchangePage.scss';
import {fetch} from "whatwg-fetch";
import AbortController from "../../libs/abort-controller";

const abortableFetch = ('signal' in new Request('')) ? window.fetch : fetch;
const abortController = ('AbortController' in window) ? window.AbortController : AbortController;

class ExchangePage extends React.Component {
  state = {
    agreeToLicense: false,
    agreeToOrder: false,
    headerSize: 116.25,
    textSize: 16,
    in_wallet: '',
    out_wallet: '',
    wrongWallet: false,
    validWallet: false,
    qr: false,
    qr_uri: '',
    copied: false,
    copiedText: 'exchange.accounts.wallet_copied',
    lightbox: false,
    addressLoading: false,
    addressInLoading: false
  };
  container = React.createRef();

  componentDidMount() {
    this.resizeText();
    window.addEventListener('resize', this.resizeText);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeText);
  }

  resizeText = () => {
    if (!this.container.current) {
      return;
    }
    const percentage = this.container.current.offsetHeight / 471;
    const headerSize = 116.25 * percentage;
    const textSize = 16 * percentage;

    this.setState({
      headerSize,
      textSize
    });
  };

  onInput = (e) => {
    const value = e.target.value;
    let signal;
    if (value === '') {
      this.setState({
      wrongWallet: false,
      validWallet: false,
      out_wallet: value,
      in_wallet: '',
      qr_uri: ''
    });
      return;
    }
    this.setState({
      wrongWallet: false,
      validWallet: false,
      addressLoading: true,
      out_wallet: value,
      in_wallet: '',
      qr_uri: ''
    });
    if (this.abortController !== undefined) {
      this.abortController.abort();
    }
    this.abortController = new abortController();
    signal = this.abortController.signal;
    return abortableFetch(`${state.serverName}/api/validate_addr.json/${value}`, {
      signal
    })
      .then(r => r.json())
      .then(r => {
        if (r.error) {
          this.setState({
            wrongWallet: true,
            addressLoading: false
          });
        } else {
          this.setState({
            validWallet: true,
            addressLoading: false
          });
        }
      }, e => {
        if (e.name !== "AbortError") {
          this.setState({
            wrongWallet: false,
            validWallet: false
          });
          console.log(e);
        }
      });
  };

  copyToClipboard = (e, copiedText) => {
    if (e.target.value.length > 0) {
      e.target.setSelectionRange(0, e.target.value.length);
      document.execCommand('copy');
      e.target.setSelectionRange(0, 0);
      this.setState({
        copied: true,
        copiedText
      });
    }
  }

  validateAll = () => {
    if (
      (state.calculator.exceeded && !this.state.agreeToOrder)
      || !this.state.agreeToLicense) {
      this.setState({
        agreementsPopup: true
      });
      return;
    }
    this.checkMayPay();
  }

  checkMayPay = () => {
    const {in: curr_in, amountIn} = state.calculator;
    const mayPay = state.getMayPay(curr_in.id);
    if (mayPay !== undefined && amountIn > mayPay) {
      this.setState({
        mayPayPopup: true,
        mayPay
      });
    } else {
      this.checkExceeded();
    }
  }

  checkExceeded = () => {
    const {amountOut, out: curr_out} = state.calculator;
    const availableAmountOut = state.getAvailableAmount(curr_out.id);
    if (amountOut > availableAmountOut) {
      this.setState({
        popup: true,
        availableAmountOut
      });
      state.calculator.exceeded = true;
    } else {
      this.getInWallet();
    }
  }

  getInWallet = () => {
    this.setState({
      addressInLoading: true,
      in_wallet: '',
      qr_uri: ''
    });
    fetch(`${state.serverName}/apipay/get_uri.json/2/${state.calculator.in.id}/${state.calculator.out.id}/${this.state.out_wallet}/${state.calculator.amountOut}`)
      .then(r => r.json())
      .then(({addr_in: in_wallet, uri: qr_uri, error}) => {
        if (error) {
          if (/address not valid/.exec(error)) {
            this.setState({
              addressInLoading: false,
              validWallet: false,
              wrongWallet: true,
            });
          } else {
            throw(error);
          }
        } else {
          this.setState({
            addressInLoading: false,
            in_wallet,
            qr_uri
          });
        }
      });
  }

  resetForm = () => {
    this.setState({
      out_wallet: '',
      in_wallet: '',
      qr_uri: '',
      wrongWallet: false,
      validWallet: false,
      agreeToOrder: false,
      agreeToLicense: false
    });
  }

  render() {
    const style=<style>
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
    </style>;
    let header = i18n.t('exchange.header.exchange');
    let rateInfo = <span key="line1">
      <span className="bold">{`${i18n.t('exchange.rateInfo.rate')}:`}</span>
      {
        //eslint-disable-next-line eqeqeq
        ` ${state.calculator.amountIn == 0?0:1} ${state.calculator.in.code} = ${state.calculator.rate} ${state.calculator.out.code}`}
      {/*<span className="bold">{` ${i18n.t('exchange.rateInfo.commission')}:`}</span>*/}
      {/*{` ${this.state.commission} ${state.calculator.out.code}`}*/}
    </span>;
    const checkboxes = [
      <div className="row" key="license-agreements">
        <div
          className={'checkbox'+(this.state.agreeToLicense?' active':'')}
          onClick={() => this.setState({
            agreeToLicense: !this.state.agreeToLicense
          })}
        />
        <label
          onClick={() => this.setState({
            agreeToLicense: !this.state.agreeToLicense
          })}
        >{i18n.t('exchange.checkboxes.licenses', {
          privacy_policy_link: <a
            key="privacy_policy"
            href={`/locales/${i18n.lang}/privacy_policy.pdf`}
            target="_blank"
            onClick={e => e.stopPropagation()}
          >
            {i18n.t('exchange.checkboxes.privacy_policy_link')}
          </a>,
          terms_of_use_link: <a
            key="terms_of_use"
            href={`/locales/${i18n.lang}/terms_of_use.pdf`}
            target="_blank"
            onClick={e => e.stopPropagation()}
          >
            {i18n.t('exchange.checkboxes.terms_of_use_link')}
          </a>
        })}</label>
      </div>
    ];

    if (state.calculator.exceeded) {
      header = i18n.t('exchange.header.order');
      const availableAmountOut = state.getAvailableAmount(state.calculator.out.id);
      rateInfo = [
        rateInfo,
        <br key="br"/>,
        <span key="line2">
          <span className="bold">{`${i18n.t('exchange.rateInfo.available')}:`}</span>
          {` ${availableAmountOut} ${state.calculator.out.code}, `}
          <span className="bold">{ `${i18n.t('exchange.rateInfo.debt')}:`}</span>
          {` ${state.calculator.amountOut - availableAmountOut} ${state.calculator.out.code}`}
        </span>
      ];
      checkboxes.unshift(<div className="row" key="order-agreements">
        <div
          className={'checkbox'+(this.state.agreeToOrder?' active':'')}
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

    return <div className="exchange-page">
      {style}
      <div className="container-950">
        <h1>{header}</h1>
        <ExchangeForm onChange={this.resetForm}/>
        <div className="rate-info">
          {rateInfo}
        </div>
        <div className="acceptance-checkboxes">
          {checkboxes}
        </div>
      </div>
      <div className="accounts-box" ref={this.container}>
        <h2 className="section-name">{i18n.t('exchange.accounts.header')}</h2>
        <div className="accounts-fg">
          <span className="account-out-label">{i18n.t('exchange.accounts.out_label', {currency: state.calculator.out.code})}</span>
          <input className="account-out-input" value={this.state.out_wallet} onInput={this.onInput} />
          {this.state.wrongWallet && <span className="account-out-error">{i18n.t('exchange.accounts.wrong_account')}</span>}
          {this.state.addressLoading && <div className="next-btn"><div className="address-loader"/></div>}
          {(this.state.validWallet && state.calculator.amountOut > 0) && <button className="next-btn" onClick={this.validateAll}>{i18n.t('exchange.accounts.next')}</button>}
          {this.state.in_wallet !== '' && <span className="account-in-label">{i18n.t('exchange.accounts.in_label', {currency: state.calculator.in.code})}</span>}
          <input title={i18n.t('exchange.accounts.click_to_copy')} className="account-in-input" readOnly={true} onClick={(e) => this.copyToClipboard(e, 'exchange.accounts.wallet_copied')} value={this.state.in_wallet}/>
          {(this.state.in_wallet !== '' && this.state.qr_uri !== '') && <button className="qr-code-btn" onClick={() => this.setState({
            qr: true
          })}>{i18n.t('exchange.accounts.qr_code')}</button>}
          {this.state.addressInLoading && <div className="qr-code-btn"><div className="address-loader"/></div>}
        </div>
      </div>
      {(this.state.in_wallet && ['ERA', 'COMPU'].includes(state.calculator.in.code)) && <div className="era-warning">
        <div className="container-950">
          <h1>{i18n.t('exchange.era_warning.header')}</h1>
          <div className="right-part">
            <span>{i18n.t('exchange.era_warning.text')}</span>
            <div>
              <input title={i18n.t('exchange.era_warning.click_to_copy')} value={`${state.calculator.out.code}:${this.state.out_wallet}`} readOnly onClick={(e) => this.copyToClipboard(e, 'exchange.era_warning.wallet_copied')} />
              <button className="question-mark-btn" onClick={() => this.setState({lightbox: true})}> </button>
            </div>
          </div>
        </div>
      </div>}
      {this.state.in_wallet && <div className="container-950 ta-center">
        <p>
          {this.state.order && <span>{i18n.t('exchange.success.message[0]')}<br/></span>}
          {i18n.t('exchange.success.message[1]')}
        </p>
        <hr className="short-hr"/>
        <p>
          {i18n.t('exchange.success.message[2]')}
        </p>
        <Link to="/payments" className="btn">{i18n.t('exchange.success.payments_button')}</Link>
      </div>}
      <Popup
        open={this.state.qr}
        close={() => this.setState({qr: !this.state.qr})}
      >
        <QRCode
          logo="/img/currencies/btc-light.png"
          value={`${this.state.qr_uri}`}
        />
      </Popup>
      <Popup
        open={this.state.copied}
        close={() => this.setState({copied: !this.state.copied})}
      >
        <h1>{i18n.t(this.state.copiedText)}</h1>
        <Button onClick={() => this.setState({copied: !this.state.copied})}>{i18n.t('ok')}</Button>
      </Popup>
      <Lightbox
        open={this.state.lightbox}
        close={() => this.setState({lightbox: !this.state.lightbox})}
        content={[
          `/locales/${i18n.lang}/img/era-node-guide.png`,
          `/locales/${i18n.lang}/img/era-mobile-guide.png`
        ]}
      />
      <Popup
        open={this.state.agreementsPopup}
        close={() => this.setState({agreementsPopup: !this.state.agreementsPopup})}
      >
        <h1>{i18n.t('exchange.agreementsPopup.header')}</h1>
        <Button onClick={() => this.setState({agreementsPopup: !this.state.agreementsPopup})}>{i18n.t('ok')}</Button>
      </Popup>
      <Popup
        open={this.state.popup}
        close={() => this.setState({popup: !this.state.popup})}
      >
        <h1>{i18n.t('limitExceededPopup.header', {currency: state.calculator.out.name})}</h1>
        <p>{i18n.t('limitExceededPopup.text1', {
          currencyIn: state.calculator.in.code,
          currencyOut: state.calculator.out.code,
          availableAmountIn: this.state.availableAmountIn,
          availableAmountOut: this.state.availableAmountOut
        })}</p>
        <p>{i18n.t('limitExceededPopup.text2')}</p>
        <Button onClick={() => {
          this.setState({
            popup: false
          });
          this.getInWallet();
        }}>{i18n.t('continue')}</Button>
      </Popup>
      <Popup
        open={this.state.mayPayPopup}
        close={() => this.setState({mayPayPopup: !this.state.mayPayPopup})}
      >
        <h1>{i18n.t('maypayExceededPopup.header', {currency: state.calculator.in.name})}</h1>
        <p>{i18n.t('maypayExceededPopup.text1', {
          currencyIn: state.calculator.in.code,
          mayPay: this.state.mayPay
        })}</p>
        <p>{i18n.t('maypayExceededPopup.text2', {
          currencyIn: state.calculator.in.code,
          currencyOut: state.calculator.out.code
        })}</p>
        <Button onClick={() => {
          this.setState({
            mayPayPopup: false
          });
          this.checkExceeded();
        }}>{i18n.t('continue')}</Button>
      </Popup>
    </div>;
  }
}

export default view(ExchangePage);
