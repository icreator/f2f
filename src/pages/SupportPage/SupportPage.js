// @flow
import React from 'react'
import { view } from 'react-easy-state'
import * as jsonpath from 'jsonpath'
import validate from 'web-form-validator'
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
  popup: boolean,
  formData: {
    name: string,
    email: string,
    text: string
  },
  errors: {
    name?: string,
    email?: string,
    text?: string
  }
}

class SupportPage extends React.Component<PropTypes, StateTypes> {
  state = {
    currentTab: 0,
    headerSize: 116.25,
    textSize: 14,
    inputSize: 16,
    popup: false,
    formData: {
      name: '',
      email: '',
      text: ''
    },
    errors: {}
  }
  shouldValidate: boolean = false
  container: { current: null | HTMLDivElement } = React.createRef()

  switchTab = (id: number) => {
    this.setState({
      currentTab: id
    })
  }

  componentDidMount () {
    this.resizeText()
    this.validate()
    window.addEventListener('resize', this.resizeText)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeText)
  }

  componentDidUpdate (prevProps: PropTypes, prevState: StateTypes) {
    if (JSON.stringify(this.state.formData) !== JSON.stringify(prevState.formData)) {
      this.validate()
    }
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

  validate = () => {
    if (!this.shouldValidate) {
      return false
    }
    const schema = {
      name: [{
        rule: 'minLength',
        option: 2,
        error: 'supportPage.email.errors.name_length'
      }, {
        rule: 'required',
        error: 'supportPage.email.errors.name_required'
      }],
      email: [{
        rule: 'email',
        error: 'supportPage.email.errors.email_invalid'
      }, {
        rule: 'required',
        error: 'supportPage.email.errors.email_required'
      }],
      text: [{
        rule: 'minLength',
        option: 10,
        error: 'supportPage.email.errors.text_length'
      }, {
        rule: 'required',
        error: 'supportPage.email.errors.text_required'
      }]
    }

    const { errors, isValid } = validate(schema, this.state.formData)
    this.setState({
      errors: {
        name: '',
        email: '',
        text: '',
        ...errors
      }
    })
    return isValid
  }

  submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    this.shouldValidate = true
    if (!this.validate()) {
      return
    }
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
      .email-container label,
      .email-container .error {
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
              <input onInput={(e: SyntheticEvent<HTMLInputElement>) => {
                this.setState({
                  formData: {
                    ...this.state.formData,
                    name: e.currentTarget.value
                  }
                })
              }} className={this.state.errors.name ? 'has-error' : ''} />
              {this.state.errors.name && <span className='error'>{i18n.t(this.state.errors.name)}</span>}
            </div>
            <div className='input-box'>
              <label>{i18n.t('supportPage.email.email')}*</label>
              <input onInput={(e: SyntheticEvent<HTMLInputElement>) => {
                this.setState({
                  formData: {
                    ...this.state.formData,
                    email: e.currentTarget.value
                  }
                })
              }} className={this.state.errors.email ? 'has-error' : ''} />
              {this.state.errors.email && <span className='error'>{i18n.t(this.state.errors.email)}</span>}
            </div>
          </div>
          <div className='row row-textarea'>
            <label>{i18n.t('supportPage.email.message')}*</label>
            <textarea onInput={(e: SyntheticEvent<HTMLTextAreaElement>) => {
              this.setState({
                formData: {
                  ...this.state.formData,
                  text: e.currentTarget.value
                }
              })
            }} className={this.state.errors.text ? 'has-error' : ''} />
            {this.state.errors.text && <span className='error'>{i18n.t(this.state.errors.text)}</span>}
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
