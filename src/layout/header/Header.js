import React from 'react'
import { Link } from 'react-router-dom'
import { i18n } from '../../state/i18n'
import Menu from './Menu'
import './Header.scss'

export default class Header extends React.Component {
  render () {
    let className = 'header inner-header'
    let Logo = <Link className='logo' to='/'><img alt={i18n.t('logo.alt')} src='/img/logo.png' /></Link>

    if (this.props.main) {
      className = 'header'
      Logo = ''
    }

    return <header className={className}>
      <div className='container'>
        {Logo}
        <Menu main={this.props.main} />
      </div>
    </header>
  }
}
