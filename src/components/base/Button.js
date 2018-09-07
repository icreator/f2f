import React from 'react';
import './Button.scss';

export default class Button extends React.Component {
  render() {
    const { children, ...rest } = this.props;
    return <button className="btn" {...rest}>{children}</button>;
  }
}
