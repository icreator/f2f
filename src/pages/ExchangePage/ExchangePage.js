import React from 'react';
import {view} from 'react-easy-state';
import {Link} from "react-router-dom";
import {i18n} from "../../state/i18n";
import ExchangeForm from "../../components/ExchangeForm/ExchangeForm";
import Popup from "../../components/Popup/Popup";
import Button from "../../components/Button/Button";
import QRCode from "../../components/QRCode";
import Lightbox from "../../components/Lightbox/Lightbox";
import './ExchangePage.scss';

class ExchangePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: false,
      currIn: {
        code: 'btc',
        name: 'bitcoin'
      },
      currOut: {
        code: 'era',
        name: 'erachain'
      },
      rate: 2827.4300442,
      commission: 14.0668506,
      available: 1732.63248257,
      debt: 1080.73767109,
      agreeToLicense: false,
      agreeToOrder: false,
      headerSize: 116.25,
      textSize: 16,
      in_wallet: '',
      wrongWallet: false,
      qr: false,
      copied: false,
      copiedText: 'exchange.accounts.wallet_copied',
      lightbox: false
    };
    this.container = React.createRef();
    this.resizeText = this.resizeText.bind(this);
    this.onInput = this.onInput.bind(this);
    this.retrieveInWallet = this.retrieveInWallet.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  componentDidMount() {
    this.resizeText();
    window.addEventListener('resize', this.resizeText);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeText);
  }

  resizeText() {
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
  }

  onInput(e) {
    if (e.target.value === '1') {
      this.setState({
        wrongWallet: true
      });
      return;
    }
    if (this.state.wrongWallet) {
      this.setState({
        wrongWallet: false
      });
      return;
    }
  }

  retrieveInWallet() {
    this.setState({
      in_wallet: '7GciXA4wt5GBd1tDFEcaK8fvEgCgSdSst'
    });
  }

  copyToClipboard(e, copiedText) {
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
      {` 1 ${this.state.currIn.code} = ${this.state.rate} ${this.state.currOut.code}, `}
      <span className="bold">{` ${i18n.t('exchange.rateInfo.commission')}:`}</span>
      {` ${this.state.commission} ${this.state.currOut.code}`}
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

    if (this.state.order) {
      header = i18n.t('exchange.header.order');
      rateInfo = [
        rateInfo,
        <br key="br"/>,
        <span key="line2">
          <span className="bold">{`${i18n.t('exchange.rateInfo.available')}:`}</span>
          {` ${this.state.available} ${this.state.currOut.code}, `}
          <span className="bold">{ `${i18n.t('exchange.rateInfo.debt')}:`}</span>
          {` ${this.state.debt} ${this.state.currOut.code}`}
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
        <h1
          onClick={() => {
            this.setState({
              order: !this.state.order
            })
          }}
        >{header}</h1>
        <ExchangeForm/>
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
          <span className="account-in-label">{i18n.t('exchange.accounts.in_label', {currency: 'ERA'})}</span>
          <input className="account-in-input" onInput={this.onInput} />
          {this.state.wrongWallet && <span className="account-in-error">{i18n.t('exchange.accounts.wrong_account')}</span>}
          <button className="next-btn" onClick={this.retrieveInWallet}>{i18n.t('exchange.accounts.next')}</button>
          {this.state.in_wallet !== '' && <span className="account-out-label">{i18n.t('exchange.accounts.out_label', {currency: 'BTC'})}</span>}
          <input title={i18n.t('exchange.accounts.click_to_copy')} className="account-out-input" readOnly={true} onClick={(e) => this.copyToClipboard(e, 'exchange.accounts.wallet_copied')} value={this.state.in_wallet}/>
          {this.state.in_wallet !== '' && <button className="qr-code-btn" onClick={() => this.setState({
            qr: true
          })}>{i18n.t('exchange.accounts.qr_code')}</button>}
        </div>
      </div>
      {this.state.in_wallet && <div className="era-warning">
        <div className="container-950">
          <h1>{i18n.t('exchange.era_warning.header')}</h1>
          <div className="right-part">
            <span>{i18n.t('exchange.era_warning.text')}</span>
            <div>
              <input title={i18n.t('exchange.era_warning.click_to_copy')} value="BTC:7GciXA4wt5GBd1tDFEcaK8fvEgCgSdSst" readOnly onClick={(e) => this.copyToClipboard(e, 'exchange.era_warning.wallet_copied')} />
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
          value={`bitcoin:${this.state.in_wallet}`}
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
    </div>;
  }
}

export default view(ExchangePage);
