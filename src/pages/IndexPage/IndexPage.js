import React from 'react';
import {view} from 'react-easy-state';
import {Link} from "react-router-dom";
import { i18n } from '../../state/i18n';
import Footer from '../../layout/footer/Footer';
import Button from '../../components/Button/Button';
import ExchangeForm from '../../components/ExchangeForm/ExchangeForm';
import Header from "../../layout/header/Header";
import AboutUs from "./AboutUs/AboutUs";
import Rates from "./Rates/Rates";
import Popup from "../../components/Popup/Popup";
import './IndexPage.scss';

class IndexPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popup: false
    };
    this.exchange = this.exchange.bind(this);
  }

  exchange() {
    this.setState({
      popup: true
    });
  }

  componentDidMount() {
    console.log(this.props);
    if (this.props.location.hash) {
      console.log(this.props.location.hash);
      document.querySelector(this.props.location.hash).scrollIntoView({
        behavior: 'smooth'
      });
    }
  }

  render() {
    return (<div className="index-page">
      <div className="cool-background">
        <Header main/>
        <div className="container-950">
          <div className="index__container">
            <img className="logo" src="/img/index-logo.png" alt={i18n.t("logo.alt")} />
            <div className="exchange-form-container">
              <ExchangeForm />
              <Button onClick={() => this.exchange()} style={{alignSelf: "center", marginTop: "65px"}}>{i18n.t('calculator.btn')}</Button>
            </div>
          </div>
        </div>
        <Rates />
      </div>
      <AboutUs />
      <Footer/>
      <Popup
        open={this.state.popup}
        close={() => this.setState({popup: !this.state.popup})}
      >
        <h1>{i18n.t('limitExceededPopup.header', {currency: 'ERA'})}</h1>
        <p>{i18n.t('limitExceededPopup.text1', {
          currencyIn: 'ERA',
          currencyOut: 'BTC',
          availableAmountIn: 10051.458107,
          availableAmountOut: 0.03864958
        })}</p>
        <p>{i18n.t('limitExceededPopup.text2')}</p>
        <Link to="/exchange" className="btn">{i18n.t('limitExceededPopup.btn')}</Link>
      </Popup>
    </div>)
  }
}

export default view(IndexPage);
