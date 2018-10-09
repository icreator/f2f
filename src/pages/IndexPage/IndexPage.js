// @flow
import React from 'react'
import { view } from 'react-easy-state'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { i18n } from '../../state/i18n'
import Footer from '../../layout/footer/Footer'
import Button from '../../components/Button/Button'
import ExchangeForm from '../../components/ExchangeForm/ExchangeForm'
import Header from '../../layout/header/Header'
import AboutUs from './AboutUs/AboutUs'
import Rates from './Rates/Rates'
import Popup from '../../components/Popup/Popup'
import state from '../../state/state'
import './IndexPage.scss'

type PropTypes = {
  history: {
    push: (string) => void
  },
  location: {
    hash: string
  }
}
type StateTypes = {
  popup: boolean,
  mayPayPopup: boolean,
  availableAmountIn?: number,
  availableAmountOut?: number,
  mayPay?: number
}

class IndexPage extends React.Component<PropTypes, StateTypes> {
  state = {
    popup: false,
    mayPayPopup: false
  }

  exchange = () => {
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
      this.props.history.push('/exchange')
    }
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
    this.exchange()
  }

  componentDidMount () {
    if (this.props.location.hash) {
      const aboutUs = document.querySelector(this.props.location.hash)
      if (aboutUs) {
        aboutUs.scrollIntoView({
          behavior: 'smooth'
        })
      }
    }
  }

  render () {
    return <div className='index-page'>
      <div className='cool-background'>
        <Header main />
        <div className='container-950'>
          <div className='index__container'>
            <img className='logo' src='/img/index-logo.png' alt={i18n.t('logo.alt')} />
            <div className='exchange-form-container'>
              <ExchangeForm />
              <Button onClick={() => this.checkMayPay()} style={{ alignSelf: 'center', marginTop: '65px' }}>{i18n.t('calculator.btn')}</Button>
            </div>
          </div>
        </div>
        <Rates />
      </div>
      <AboutUs />
      <Footer />
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
        <Link to='/exchange' className='btn'>{i18n.t('limitExceededPopup.btn')}</Link>
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
          this.exchange()
        }}>{i18n.t('maypayExceededPopup.btn')}</Button>
      </Popup>
    </div>
  }
}

export default withRouter(view(IndexPage))
