import React from 'react'
import PropTypes from 'prop-types'
import {
  inject,
  observer,
} from 'mobx-react'

import {
  Redirect,
} from 'react-router-dom'
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
      accesstoken: '0f70d421-7163-4338-8dd6-aca2fac6ddbd',
      helpText: '',
    }
  }

  componentDidMount() {
    if (this.props.user.isLogin) {
      this.context.router.history.replace('/info')
    }
  }

  getFrom = (location) => {
    location = location || this.props.location
    const query = queryString.parse(location.search)
    return query.from || '/info'
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
    const isLogin = this.props.user.isLogin
    const from = this.getFrom()

    if (isLogin) {
      return (
        <Redirect to={from} />
      )
    }
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
  location: PropTypes.object.isRequired,
}

export default withStyles(loginStyles)(UserLogin)
