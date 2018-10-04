// @flow
import React from 'react'
import { view } from 'react-easy-state'
import * as jsonpath from 'jsonpath'
import { i18n } from '../../state/i18n'
import './SupportPage.scss'
import Popup from '../../components/Popup/Popup'
import Button from '../../components/Button/Button'

type PropTypes = {||}
type StateTypes = {
  currentTab: number,
  headerSize: number,
  textSize: number,
  inputSize: number,
  popup: boolean
}

class SupportPage extends React.Component<PropTypes, StateTypes> {
  state = {
    currentTab: 0,
    headerSize: 116.25,
    textSize: 14,
    inputSize: 16,
    popup: false
  }
  container: { current: null | HTMLDivElement } = React.createRef()

  switchTab = (id: number) => {
    this.setState({
      currentTab: id
    })
  }

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
    const percentage = this.container.current.offsetHeight / 506
    const headerSize = 116.25 * percentage
    const textSize = 14 * percentage
    const inputSize = 16 * percentage

    this.setState({
      headerSize,
      textSize,
      inputSize
    })
  }

  submit = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault()
    this.setState({
      popup: true
    })
  }

  render () {
    const style = <style>
      {`
      .email-container .section-name {
        font-size: ${this.state.headerSize}px;
      }
      .email-container label {
        font-size: ${this.state.textSize}px;
      }
      .email-container input,
      .email-container textarea,
      .email-container button {
        font-size: ${this.state.inputSize}px !important;
      }
      `}
    </style>
    const translation = i18n.translations[i18n.lang]
    const tabTitles = jsonpath.query(translation, 'supportPage.tabs..title')
    const tabListItems = []
    const tabText = [
      <h2 key='title'>
        {tabTitles[this.state.currentTab]}
      </h2>,
      <div key='text' dangerouslySetInnerHTML={{ __html: jsonpath.value(translation, `supportPage.tabs[${this.state.currentTab}].text`) }} />
    ]

    for (let key = 0; key < tabTitles.length; key += 1) {
      // eslint-disable-next-line
      const active = (key == this.state.currentTab)?'active':'';
      tabListItems.push(<li key={key} className={active} onClick={() => this.switchTab(key)}>
        {tabTitles[key]}
      </li>)
    }

    return <div className='support-page'>
      {style}
      <div className='tabs-container container-950'>
        <div className='tab-names'>
          <ul>
            {tabListItems}
          </ul>
        </div>
        <div className='tab-content'>
          {tabText}
        </div>
      </div>
      <div className='email-container' ref={this.container}>
        <h1 className='section-name'>{i18n.t('supportPage.email.header')}</h1>
        <form className='email-inner-container' onSubmit={this.submit}>
          <div className='row'>
            <div className='input-box'>
              <label>{i18n.t('supportPage.email.name')}*</label>
              <input required />
            </div>
            <div className='input-box'>
              <label>{i18n.t('supportPage.email.email')}*</label>
              <input type='email' required />
            </div>
          </div>
          <div className='row row-textarea'>
            <label>{i18n.t('supportPage.email.message')}</label>
            <textarea />
          </div>
          <div className='row row-center'>
            <button type='submit' className='btn'>{i18n.t('supportPage.email.send')}</button>
          </div>
        </form>
      </div>
      <Popup
        open={this.state.popup}
        close={() => this.setState({ popup: !this.state.popup })}
      >
        <h1>{i18n.t('supportPage.email.success')}</h1>
        <Button onClick={() => this.setState({ popup: !this.state.popup })}>{i18n.t('ok')}</Button>
      </Popup>
    </div>
  }
}

export default view(SupportPage)
