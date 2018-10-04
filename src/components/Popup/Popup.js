// @flow
import * as React from 'react'
import './Popup.scss'

type PropTypes = {
  open: boolean,
  close: () => void,
  children: React.Node
}
type StateTypes = {
  show: boolean
}

class Popup extends React.Component<PropTypes, StateTypes> {
  state = {
    show: false
  }
  popup: { current: null | HTMLDivElement } = React.createRef()

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

  static getDerivedStateFromProps (props: PropTypes, state: StateTypes) {
    if (props.open !== state.show) {
      return {
        show: props.open
      }
    }
    return null
  }

  handleClickOutside = (event: MouseEvent) => {
    if (!(event.target instanceof Node)) { // eslint-disable-line no-undef
      return
    }
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
