// @flow

import * as React from 'react'
import { i18n } from '../../state/i18n'
import state from '../../state/state'
import './CurrencySelector.scss'

type PropTypes = {
  value: {
    id: number,
    name: string,
    icon: string,
    code: string,
    system?: string
  },
  onChange: ({
    id: number,
    name: string,
    icon: string,
    code: string,
    min?: number,
    system?: string
  }) => void,
  data: { [string]: {
    id: number,
    name: string,
    icon: string,
    code: string,
    name2: string,
    min?: number,
    may_pay?: number,
    bal?: number,
    system?: string
  }}
}
type StateTypes = {
  dropdown: boolean,
  current: number
}

class CurrencySelector extends React.Component<PropTypes, StateTypes> {
  state = {
    dropdown: false,
    current: this.props.value.id
  }

  dropdown: { current: null | HTMLDivElement } = React.createRef()

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (event: MouseEvent) => {
    if (!(event.target instanceof Node)) { // eslint-disable-line no-undef
      return
    }
    if (this.dropdown.current && !this.dropdown.current.contains(event.target)) {
      this.setState({
        dropdown: false,
        current: this.props.value.id
      })
    }
  }

  setValue = (currency: {
    id: number,
    name: string,
    icon: string,
    code: string,
    min?: number,
    system?: string
  }) => {
    this.setState({
      dropdown: false
    })
    this.props.onChange(currency)
  };

  render () {
    let dropdown = ''
    let value = ['-- ', i18n.t('calculator.placeholder'), ' --']
    let fieldClass = 'field'

    if (this.state.dropdown) {
      dropdown = []
      fieldClass += ' active'
      for (let code in this.props.data) {
        let currency = this.props.data[code]
        let className = currency.id === this.state.current ? 'current' : ''
        dropdown.push(<li
          key={currency.name}
          className={className}
          onClick={() => this.setValue(currency)}
          onMouseOver={() => this.setState({
            current: currency.id
          })}
        >
          <img alt={code} src={`${state.serverName}${state.icon_url}/${currency.icon}`} className='currency-icon' /> <span className='currency-name'>{currency.name}</span>
        </li>)
      }
      dropdown = <ul className='dropdown'>
        {dropdown}
      </ul>
    }

    if (this.props.value) {
      value = [
        <img alt={this.props.value.name} key='icon' src={`${state.serverName}${state.icon_url}/${this.props.value.icon}`} className='currency-icon' />,
        <span key='name' className='currency-name'>{this.props.value.name}</span>
      ]
    }

    return <div ref={this.dropdown} className='currency-selector-container'>
      <div className={fieldClass} onClick={() => this.setState({
        dropdown: !this.state.dropdown,
        current: this.props.value.id
      })}>
        {value}
      </div>
      <input type='hidden' />
      {dropdown}
    </div>
  }
}

export default CurrencySelector
