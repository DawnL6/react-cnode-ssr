import React from 'react'
import {
  observer,
  inject,
} from 'mobx-react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Tabs, { Tab } from 'material-ui/Tabs'
import List from 'material-ui/List/List'
import { CircularProgress } from 'material-ui/Progress'
import qs from 'query-string'
// import Button from 'material-ui/Button'

import Container from '../../views/layout/container'
import TopicListItem from './list-item'
import { tabs } from '../../util/variable-define'


@inject((stores) => {
  return {
    appState: stores.appState,
    topicStore: stores.topicStore,
  }
}) @observer
class TopicList extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {
      tabIndex: 0,
    }
  }

  componentDidMount() {
    const tab = this.getTab()
    this.props.topicStore.fetchTopics(tab)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.props.topicStore.fetchTopics(this.getTab(nextProps.location.search))
    }
  }

  getTab(search) {
    search = search || this.props.location.search
    const query = qs.parse(search)
    return query.tab || 'all'
  }

  bootstrap() {
    const tab = this.getTab()
    return this.props.topicStore.fetchTopics(tab).then(() => {
      return true
    })
  }

  changeTab = (e, value) => {
    this.context.router.history.push({
      pathname: '/index',
      search: `?tab=${value}`,
    })
  }

  goDetail = (id) => {
    this.context.router.history.push(`/detail/${id}`)
  }

  render() {
    const { topicStore } = this.props
    const topicList = topicStore.topics
    const syncingTopics = topicStore.syncing
    const tab = this.getTab()
    return (
      <Container>
        <Helmet>
          <title>This is topic list</title>
          <meta name="description" content="This is description" />
        </Helmet>
        <Tabs value={tab} onChange={this.changeTab}>
          {
            Object.keys(tabs).map(t => <Tab key={t} label={tabs[t]} value={t} />)
          }
        </Tabs>
        <List>
          {
            topicList.map((topic) => {
              return (
                <TopicListItem
                  onClick={() => this.goDetail(topic.id)}
                  topic={topic}
                  key={topic.id}
                />
              )
            })
          }
          {
            syncingTopics ?
              (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '40px 0',
                  }}
                >
                  <CircularProgress color="primary" size={100} />
                </div>
              ) :
              null
          }
        </List>
      </Container>
    )
  }
}

TopicList.wrappedComponent.propTypes = {
  topicStore: PropTypes.object.isRequired,
}

TopicList.propTypes = {
  location: PropTypes.object.isRequired,
}

export default TopicList
