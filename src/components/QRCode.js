import React from 'react'
import QrCodeWithLogo from 'qr-code-with-logo'

class QRCode extends React.Component {
  constructor (props) {
    super(props)
    this.canvas = React.createRef()
    this.renderQR = this.renderQR.bind(this)
  }

  componentDidMount () {
    this.renderQR()
  }

  componentDidUpdate () {
    this.renderQR()
  }

  renderQR () {
    QrCodeWithLogo.toCanvas({
      canvas: this.canvas.current,
      content: this.props.value,
      width: 380,
      logo: {
        src: this.props.logo,
        logoSize: 0.1,
        borderSize: 0.04,
        borderRadius: 0
      }
    })
  }

  render () {
    return <canvas ref={this.canvas} style={this.props.style} />
  }
}

export default QRCode
