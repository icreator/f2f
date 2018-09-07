import React from 'react';
import {i18n} from "../../i18n";
import './Footer.scss';

export default class Footer extends React.Component {
  render() {
    let year = '';
    const currYear = (new Date()).getFullYear();

    if (currYear > 2018) {
      year = `-${currYear};`
    }

    return <footer>
      <div className="container">
        <span className="copyright">
          ©HI-TECH SERVICES LIMITED, 2018{year}
        </span>
        <nav className="footer-menu">
          <a href="/">{i18n.t('footer.privacyPolicy')}</a>
          <a href="/">{i18n.t('footer.termsOfUse')}</a>
        </nav>
        <nav className="footer-social">
          <a href="/" className="facebook">Facebook</a>
          <a href="/" className="telegram">Telegram</a>
          <a href="/" className="twitter">Twitter</a>
        </nav>
      </div>
    </footer>;
  }
}
