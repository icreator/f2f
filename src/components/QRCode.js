// @flow
import React from 'react'
import QrCodeWithLogo from 'qr-code-with-logo'

type PropTypes = {
  value: string,
  logo: string,
  style?: {}
}

class QRCode extends React.Component<PropTypes> {
  canvas: { current: null | HTMLCanvasElement } = React.createRef()

  componentDidMount () {
    this.renderQR()
  }

  componentDidUpdate () {
    this.renderQR()
  }

  renderQR = () => {
    if (!this.canvas.current) {
      return
    }
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
