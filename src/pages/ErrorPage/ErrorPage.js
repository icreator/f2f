// @flow
import React from 'react'
import Header from '../../layout/header/Header'
import { i18n } from '../../state/i18n'
import { Link } from 'react-router-dom'
import { view } from 'react-easy-state'
import './ErrorPage.scss'

class ErrorPage extends React.Component<{}> {
  render () {
    return <div className='error-page'>
      <div className='cool-background'>
        <Header main />
        <div className='container-950'>
          <img className='logo' src='/img/index-logo.png' alt={i18n.t('logo.alt')} />
          <h1>{i18n.t('404.header')}</h1>
          <Link to='/' className='btn'>{i18n.t('404.returnToHome')}</Link>
        </div>
      </div>
    </div>
  }
}

export default view(ErrorPage)
