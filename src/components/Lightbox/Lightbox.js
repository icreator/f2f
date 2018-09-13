import React from 'react';
import './Lightbox.scss';

class Lightbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      current: 0
    };
    this.popup = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
    this.go = this.go.bind(this);
  }

  componentDidMount() {
    if (this.props.open !== this.state.show) {
      this.setState({
        show: this.props.open
      });
    }
    document.addEventListener('keydown', this.handleKeyboard);
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyboard);
  }

  componentDidUpdate() {
    if (this.props.open !== this.state.show) {
      this.setState({
        show: this.props.open
      });
    }
  }

  handleClickOutside(event) {
    if (this.popup.current && !this.popup.current.contains(event.target)) {
      this.props.close();
    }
  }

  handleKeyboard(event) {
    switch (event.keyCode) {
      case 27:
        this.props.close();
        break;
      case 39:
        this.go('right');
        break;
      case 37:
        this.go('left');
        break;
      default:
        //do nothin'
        break;
    }
  }

  go(direction) {
    const content = this.props.content;
    let current = this.state.current;
    if (direction === 'right') {
      current = (current + 1 >= content.length)?0:current + 1;
    } else {
      current = (current - 1 >= 0)?current - 1:content.length - 1;
    }
    this.setState({
      current
    });
  }

  render() {
    const {show, current} = this.state;
    const {close, content} = this.props;

    if (!show) {
      return '';
    }

    return <div className="lightbox-container">
      <span className="lightbox-close" onClick={close} />
      <div className="lightbox-content" ref={this.popup}>
        {content.length > 1 && <div className="left-arrow" onClick={() => this.go('left')} />}
        <div className="lightbox-image" style={{backgroundImage: `url(${content[current]})`}} />
        {content.length > 1 && <div className="right-arrow" onClick={() => this.go('right')} />}
      </div>
    </div>;
  }
}

export default Lightbox;
