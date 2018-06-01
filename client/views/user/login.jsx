import React from 'react'
import PropTypes from 'prop-types'
import {
  inject,
  observer,
} from 'mobx-react'

import queryString from 'query-string'

import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'
import { withStyles } from 'material-ui/styles'

import UserWrapper from './user'
import loginStyles from './styles/login-style'

@inject((stores) => {
  return {
    appState: stores.appState,
    user: stores.appState.user,
  }
}) @observer

class UserLogin extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {
      accesstoken: '',
      helpText: '',
    }
  }

  componentDidMount() {
    if (this.props.user.isLogin) {
      this.context.router.history.replace('user/info')
    }
  }

  getFrom(location) {
    location = location || this.props.location
    const query = queryString.parse(location.search)
    return query.from || '/user/info'
  }

  handleLogin = () => {
    // handle login here
    if (!this.state.accesstoken) {
      return this.setState({
        helpText: '必须填写',
      })
    }
    this.setState({
      helpText: '',
    })
    return this.props.appState.login(this.state.accesstoken)
      .then(() => {
        this.context.router.history.replace('user/info')
      })
      .catch((msg) => {
        console.log(msg)
      })
  }

  handleInput = (event) => {
    this.setState({
      accesstoken: event.target.value.trim(),
    })
  }

  render() {
    const { classes } = this.props
    return (
      <UserWrapper>
        <div className={classes.root}>
          <TextField
            label="请输入Cnode AccessToken"
            placeholder="请输入Cnode AccessToken"
            required
            helperText={this.state.helpText}
            value={this.state.accesstoken}
            onChange={this.handleInput}
            className={classes.input}
          />
          <Button
            variant="raised"
            color="primary"
            onClick={this.handleLogin}
            className={classes.loginButton}
          >
            登 录
          </Button>
        </div>
      </UserWrapper>
    )
  }
}

UserLogin.wrappedComponent.propTypes = {
  appState: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
}

UserLogin.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(loginStyles)(UserLogin)
