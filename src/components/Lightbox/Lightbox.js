// @flow
import * as React from 'react'
import './Lightbox.scss'

type PropTypes = {
  open: boolean,
  close: () => void,
  content: Array<string>
}
type StateTypes = {
  show: boolean,
  current: number
}

class Lightbox extends React.Component<PropTypes, StateTypes> {
  state = {
    show: false,
    current: 0
  }
  popup: { current: null | HTMLDivElement } = React.createRef()

  componentDidMount () {
    if (this.props.open !== this.state.show) {
      this.setState({
        show: this.props.open
      })
    }
    document.addEventListener('keydown', this.handleKeyboard)
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside)
    document.removeEventListener('keydown', this.handleKeyboard)
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

  handleKeyboard = (event: KeyboardEvent) => {
    switch (event.keyCode) {
    case 27:
      this.props.close()
      break
    case 39:
      this.go('right')
      break
    case 37:
      this.go('left')
      break
    default:
      // do nothin'
      break
    }
  }

  go = (direction: 'right' | 'left') => {
    const content = this.props.content
    let current = this.state.current
    if (direction === 'right') {
      current = (current + 1 >= content.length) ? 0 : current + 1
    } else {
      current = (current - 1 >= 0) ? current - 1 : content.length - 1
    }
    this.setState({
      current
    })
  }

  render () {
    const { show, current } = this.state
    const { close, content } = this.props

    if (!show) {
      return ''
    }

    return <div className='lightbox-container'>
      <span className='lightbox-close' onClick={close} />
      <div className='lightbox-content' ref={this.popup}>
        {content.length > 1 && <div className='left-arrow' onClick={() => this.go('left')} />}
        <div className='lightbox-image' style={{ backgroundImage: `url(${content[current]})` }} />
        {content.length > 1 && <div className='right-arrow' onClick={() => this.go('right')} />}
      </div>
    </div>
  }
}

export default Lightbox
