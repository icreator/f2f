import React from "react";
import {i18n} from "../../../i18n";
import './AboutUs.scss';

class AboutUs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerSize: 52,
      textSize: 18
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

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeText);
  }

  resizeText() {
    if (!this.container.current) {
      return;
    }
    const percentage = this.container.current.offsetHeight / 530;
    const headerSize = 52 * percentage;
    const textSize = 18 * percentage;

    this.setState({
      headerSize,
      textSize
    });
  }

  render() {
    const style=<style>
      {`
      #about-us .header1,
      #about-us .header2,
      #about-us .header3,
      #about-us .header4 {
        font-size: ${this.state.headerSize}px;
      }
      #about-us .text1,
      #about-us .text2,
      #about-us .text3,
      #about-us .text4 {
        font-size: ${this.state.textSize}px;
      }
      `}
    </style>;

    return <div id="about-us" ref={this.container}>
      {style}
      <span className="header1">{i18n.t('about[0].header')}</span>
      <span className="text1">{i18n.t('about[0].text')}</span>
      <span className="header2">{i18n.t('about[1].header')}</span>
      <span className="text2">{i18n.t('about[1].text')}</span>
      <span className="header3">{i18n.t('about[2].header')}</span>
      <span className="text3">{i18n.t('about[2].text')}</span>
      <span className="header4">{i18n.t('about[3].header')}</span>
      <span className="text4">{i18n.t('about[3].text')}</span>
    </div>;
  }
}

export default AboutUs;
