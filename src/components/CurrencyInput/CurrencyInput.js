import React from 'react';
import './CurrencyInput.scss';

class CurrencyInput extends React.Component {
  state = {
    animation: '',
  }

  animationQueue = [];

  addAnimation = (className, timeout) => {
    this.animationQueue.push([className, timeout]);
    if (this.animationQueue.length === 1) {
      this.processQueue();
    }
  }

  processQueue = () => {
    if (this.animationQueue.length === 0) {
      return;
    }
    let item = this.animationQueue[0];
    this.setState({
      animation: item[0]
    });
    setTimeout(() => {
      this.animationQueue.shift()
      this.processQueue();
    }, item[1]);
  }

  blockNonNumeric = (event) => {
    if (['+', '-', 'e', ',', ' '].includes(event.key)) {
      event.preventDefault();
      return;
    }
    if (['.'].includes(event.key) && (/\./.exec(event.target.value) || event.target.value === '')) {
      event.preventDefault();
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.loading !== this.props.loading) {
      if (this.props.loading && this.state.animation === '') {
        this.addAnimation('in', 310);
      } else if (!this.props.loading && this.state.animation === 'in') {
        this.addAnimation('out', 310);
        this.addAnimation('', 0);
      }
    }
  }

  render() {
    return <div className="currency-input">
      <input
        type="number"
        value={this.props.value}
        onKeyDown={this.blockNonNumeric}
        onKeyUp={this.drawZero}
        onInput={this.props.onInput}/>
      <div className={`curtain ${this.state.animation}${this.props.error?' error':''}`}/>
    </div>;
  }
}

export default CurrencyInput;
