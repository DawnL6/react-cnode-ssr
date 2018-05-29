import React from 'react'
import {
  observer,
  inject,
} from 'mobx-react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Button from 'material-ui/Button'

import { AppState } from '../../store/app-state'


@inject('appState') @observer
export default class TopicList extends React.Component {
  componentDidMount() {
    // do something here
  }

  bootstrap() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.props.appState.count = 3
        resolve(true)
      })
    })
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>This is topic list</title>
          <meta name="description" content="This is description" />
        </Helmet>
        <Button variant="raised" color="primary">button</Button>
        <span>
          {this.props.appState.msg}
        </span>
      </div>
    )
  }
}

TopicList.propTypes = {
  appState: PropTypes.instanceOf(AppState),
}
