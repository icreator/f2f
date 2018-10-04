// @flow
import * as React from 'react'
import './Button.scss'

type PropTypes = {
  children: React.Node
}

class Button extends React.Component<PropTypes> {
  render () {
    const { children, ...rest } = this.props
    return <button className='btn' {...rest}>{children}</button>
  }
}

export default Button
