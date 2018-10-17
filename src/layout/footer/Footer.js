// @flow
import React from 'react'
import { view } from 'react-easy-state'
import { i18n } from '../../state/i18n'
import './Footer.scss'

class Footer extends React.Component<{}> {
  render () {
    let year = ''
    const currYear = (new Date()).getFullYear()

    if (currYear > 2018) {
      year = `-${currYear};`
    }

    return <footer>
      <div className='container'>
        <span className='copyright'>
          ©HI-TECH SERVICES LIMITED, 2018{year}
        </span>
        <nav className='footer-menu'>
          <a href={`/locales/${i18n.lang}/privacy_policy.pdf`} target='_blank'>{i18n.t('footer.privacyPolicy')}</a>
          <a href={`/locales/${i18n.lang}/terms_of_use.pdf`} target='_blank'>{i18n.t('footer.termsOfUse')}</a>
        </nav>
        <nav className='footer-social'>
          <a href={i18n.t('socialNetworks.facebookUrl')} target='_blank' className='facebook'>Facebook</a>
          <a href={i18n.t('socialNetworks.telegramUrl')} target='_blank' className='telegram'>Telegram</a>
          <a href={i18n.t('socialNetworks.twitterUrl')} target='_blank' className='twitter'>Twitter</a>
        </nav>
      </div>
    </footer>
  }
}

export default view(Footer)
