import React from 'react';
import {i18n} from "../../../i18n";
import './Rates.scss';

class Rates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerSize: 116.25
    };
    this.container = React.createRef();
    this.resizeText = this.resizeText.bind(this);
  }

  componentDidMount() {
    this.resizeText();
    window.addEventListener('resize', () => {
      this.resizeText();
    })
  }

  resizeText() {
    if (!this.container.current) {
      return;
    }
    const percentage = this.container.current.offsetWidth / 1198;
    const headerSize = 116.25 * percentage;

    this.setState({
      headerSize,
    });
  }

  render() {
    const styles = <style>
      {`.rates .section-name {
        font-size: ${this.state.headerSize}px;
        line-height: ${this.state.headerSize * 1.2}px;
      }`}
    </style>;

    return <div className="rates" ref={this.container}>
      {styles}
      <h1 className="section-name" style={{textAlign: "center"}}>{i18n.t('rates.header')}</h1>
      <div className="container-950 rates-table">
        <div>
          <div>
            <img alt="BTC" className="curr-img" src="/img/currencies/btc-dark.png"/>
            <span className="curr-name">Bitcoin</span>
            {/*<span className="rate-change good">↑ 0,79%</span>*/}
          </div>
          <span className="rate-usd">$8 264,34</span>
          <span className="rate-btc">1,00000000 BTC</span>
        </div>
        <div>
          <div>
            <img alt="ETH" className="curr-img" src="/img/currencies/eth-dark.png"/>
            <span className="curr-name">Ethereum</span>
            {/*<span className="rate-change good">↑ 2,24%</span>*/}
          </div>
          <span className="rate-usd">$481,85</span>
          <span className="rate-btc">0,05798150 BTC</span>
        </div>
        <div>
          <div>
            <img alt="LTC" className="curr-img" src="/img/currencies/ltc-dark.png"/>
            <span className="curr-name">Litecoin</span>
            {/*<span className="rate-change good">↑ 1,52%</span>*/}
          </div>
          <span className="rate-usd">$87,36</span>
          <span className="rate-btc">0,01056845 BTC</span>
        </div>
        <div>
          <div>
            <img alt="Dash" className="curr-img" src="/img/currencies/dash-dark.png"/>
            <span className="curr-name">Dash</span>
            {/*<span className="rate-change bad">↓ 0,31%</span>*/}
          </div>
          <span className="rate-usd">$244,99</span>
          <span className="rate-btc">0,02985135 BTC</span>
        </div>
        <div>
          <div>
            <img alt="BCH" className="curr-img" src="/img/currencies/bch-dark.png"/>
            <span className="curr-name">Bitcoin Cash</span>
            {/*<span className="rate-change bad">↓ 0,42%</span>*/}
          </div>
          <span className="rate-usd">$833,36</span>
          <span className="rate-btc">0,10156326 BTC</span>
        </div>
        <div>
          <div>
            <img alt="BTG" className="curr-img" src="/img/currencies/btg-dark.png"/>
            <span className="curr-name">Bitcoin Gold</span>
            {/*<span className="rate-change bad">↓ 0,27%</span>*/}
          </div>
          <span className="rate-usd">$30,19</span>
          <span className="rate-btc">0,00367933 BTC</span>
        </div>
        <div>
          <div>
            <img alt="ERA20" className="curr-img" src="/img/currencies/era20.png"/>
            <span className="curr-name">ERA20</span>
            {/*<span className="rate-change good">↑ 0,5%</span>*/}
          </div>
          <span className="rate-usd">$15</span>
          <span className="rate-btc">0,00001156 BTC</span>
        </div>
        <div>
          <div>
            <img alt="ERA" className="curr-img" src="/img/currencies/era.png"/>
            <span className="curr-name">ERA</span>
            {/*<span className="rate-change good">↑ 0,5%</span>*/}
          </div>
          <span className="rate-usd">$15</span>
          <span className="rate-btc">0,00001156 BTC</span>
        </div>
        <div>
          <div>
            <img alt="Compu" className="curr-img" src="/img/currencies/compu.png"/>
            <span className="curr-name">Compu</span>
            {/*<span className="rate-change good">↑ 0,5%</span>*/}
          </div>
          <span className="rate-usd">$250</span>
          <span className="rate-btc">0,00001156 BTC</span>
        </div>
      </div>
    </div>;
  }
}

export default Rates;
