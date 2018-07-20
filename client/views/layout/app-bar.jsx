import React from 'react'
import PropTypes from 'prop-types'
import {
  inject,
  observer,
} from 'mobx-react'

import { withStyles } from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import HomeIcon from 'material-ui-icons/Home'

const styleSheet = {
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
}

@inject((stores) => {
  return {
    user: stores.appState.user,
  }
}) @observer

class MainAppBar extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  componentDidMount() {
    // do something here
  }
  loginButtonClick = () => {
    if (this.props.user.isLogin) {
      this.context.router.history.push('/info')
    } else {
      this.context.router.history.push({
        pathname: '/login',
        search: `?from=${location.pathname}`,
      })
    }
  }

  goIndex = () => {
    this.context.router.history.push('/index')
  }

  render() {
    const { classes, user } = this.props
    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton color="default" aria-label="Menu" onClick={this.goIndex}>
              <HomeIcon />
            </IconButton>
            <Typography type="title" color="inherit" className={classes.flex}>
              JNode
            </Typography>
            <Button color="default" onClick={this.loginButtonClick}>
              <span>{user.isLogin ? user.info.loginName : '登录'}</span>
            </Button>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

MainAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styleSheet)(MainAppBar)
