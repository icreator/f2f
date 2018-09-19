import React from 'react';
import './CurrencyInput.scss';

class CurrencyInput extends React.Component {
  state = {
    animation: '',
  };

  lastKey = '';
  animationQueue = [];

  addAnimation = (className, timeout) => {
    this.animationQueue.push([className, timeout]);
    if (this.animationQueue.length === 1) {
      this.processQueue();
    }
  };

  processQueue = () => {
    if (this.animationQueue.length === 0) {
      return;
    }
    let item = this.animationQueue[0];
    this.setState({
      animation: item[0]
    });
    setTimeout(() => {
      this.animationQueue.shift();
      this.processQueue();
    }, item[1]);
  };

  onInput = (event) => {
    const startingValue = event.target.value;
    event.target.value = event.target.value.replace(/[^0-9.]/g, '');
    if (/(\d*\.\d*)\.(\d*)/g.exec(event.target.value)) {
      event.target.value = event.target.value.replace(/(\d*\.\d*)\.(\d*)/gm, '$1$2');
    }
    if (/^\.\d*$/g.exec(event.target.value)) {
      event.target.value = event.target.value.replace(/^\.(\d*)$/g, '0.$1');
      this.props.onInput(event);
      return;
    }
    if (event.target.value === startingValue) {
      this.props.onInput(event);
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.loading && this.animationQueue.length === 0) {
      this.addAnimation('in', 310);
    }
    if (prevProps.loading !== this.props.loading) {
      if (!this.props.loading && this.state.animation === 'in') {
        this.addAnimation('out', 310);
        this.addAnimation('', 0);
      }
    }
  }

  render() {
    return <div className="currency-input">
      <input
        placeholder='0'
        value={this.props.value}
        onInput={this.onInput}
        onChange={() => {}} // Get rid of this pesky react warning in console!
      />
      <div className={`curtain ${this.state.animation}${this.props.error?' error':''}`}/>
      <span>{this.lastKey}</span>
    </div>;
  }
}

export default CurrencyInput;
