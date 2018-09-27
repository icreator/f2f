import React from 'react'
import './Popup.scss'

class Popup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false
    }
    this.popup = React.createRef()
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount () {
    if (this.props.open !== this.state.show) {
      this.setState({
        show: this.props.open
      })
    }
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  static getDerivedStateFromProps (props, state) {
    if (props.open !== state.show) {
      return {
        show: props.open
      }
    }
    return null
  }

  handleClickOutside (event) {
    if (this.popup.current && !this.popup.current.contains(event.target)) {
      this.props.close()
    }
  }

  render () {
    if (!this.state.show) {
      return ''
    }

    return <div className='popup-container'>
      <div className='popup-content' ref={this.popup}>
        <span className='popup-close' onClick={this.props.close} />
        {this.props.children}
      </div>
    </div>
  }
}

export default Popup
