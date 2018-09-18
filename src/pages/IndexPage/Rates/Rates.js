import React from 'react';
import {i18n} from "../../../state/i18n";
import state from '../../../state/state';
import {view} from 'react-easy-state';
import './Rates.scss';

class Rates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerSize: 116.25
    };
    this.container = React.createRef();
  }

  componentDidMount() {
    this.resizeText();
    window.addEventListener('resize', () => {
      this.resizeText();
    });
    window.setTimeout(() => {
      state.loadRates();
    }, 30 * 60 * 1000);
  }

  resizeText = () => {
    if (!this.container || !this.container.current) {
      return;
    }
    const percentage = this.container.current.offsetWidth / 1198;
    const headerSize = 116.25 * percentage;

    this.setState({
      headerSize,
    });
  };

  render() {
    const currencies = {
      BTC: {
        rub: '---',
        usd: '---',
        btc: '---'
      },
      LTC: {
        rub: '---',
        usd: '---',
        btc: '---'
      },
      DASH: {
        rub: '---',
        usd: '---',
        btc: '---'
      },
      ERA: {
        rub: '---',
        usd: '---',
        btc: '---'
      },
      COMPU: {
        rub: '---',
        usd: '---',
        btc: '---'
      }
    };
    for (let key in state.rates) {
      for (let currency2 of state.rates[key]) {
        if (!currencies.hasOwnProperty(currency2[1])) {
          currencies[currency2[1]] = {};
        }
        currencies[currency2[1]][key] = currency2[0];
      }
    }
    currencies.BTC.btc = 1;

    const styles = <style>
      {`.rates .section-name {
        font-size: ${this.state.headerSize}px;
        line-height: ${this.state.headerSize * 1.2}px;
      }`}
    </style>;
    const items = [];

    if (!Object.keys(state.currencies.in).length) {
      return '';
    }

    for (let key in currencies) {
      const currency = state.currencies.in[key];
      const rates = currencies[key];
      items.push(<div key={key}>
        <div>
          <img alt={key} style={{width: '32px', height: '32px'}} className="curr-img" src={`http://face2face.cash/${state.icon_url}/${currency.icon}`}/>
          <span className="curr-name">{currency.name}</span>
        </div>
        <span className="rate-usd">{rates.rub.toLocaleString(i18n.t('intl'), {
          minimumFractionDigits: 2
        })} ₽</span>
        <span className="rate-usd">${rates.usd.toLocaleString(i18n.t('intl'), {
          minimumFractionDigits: 2
        })}</span>
        <span className="rate-btc">{rates.btc.toLocaleString(i18n.t('intl'), {
          minimumFractionDigits: 6
        })} BTC</span>
      </div>)
    }

    return <div className="rates" ref={this.container}>
      {styles}
      <h1 className="section-name" style={{textAlign: "center"}}>{i18n.t('rates.header')}</h1>
      <div className="container-950 rates-table">
        {items}
      </div>
    </div>;
  }
}

export default view(Rates);
