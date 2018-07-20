import React from 'react'
import PropTypes from 'prop-types'
import marked from 'marked'
import Helmet from 'react-helmet'
import {
  inject,
  observer,
} from 'mobx-react'

import { withStyles } from 'material-ui/styles'
import Paper from 'material-ui/Paper'
import { CircularProgress } from 'material-ui/Progress'
import Button from 'material-ui/Button'
import IconReply from 'material-ui-icons/Reply'

import Container from '../layout/container'
import { topicDetailStyle } from './styles'
import Reply from './reply'
import formatDate from '../../util/date-format'

@inject((stores) => {
  return {
    topicStore: stores.topicStore,
    user: stores.appState.user,
  }
}) @observer

class TopicDetail extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  componentDidMount() {
    const id = this.getTopicId()
    this.props.topicStore.getTopicDetail(id)
  }

  getTopicId() {
    return this.props.match.params.id
  }

  goToLogin = () => {
    this.context.router.history.push({
      pathname: '/login',
      search: `?from=${location.pathname}`,
    })
  }

  render() {
    const {
      classes,
      user,
    } = this.props
    const id = this.getTopicId()
    const topic = this.props.topicStore.detailMap[id]

    if (!topic) {
      return (
        <Container>
          <section className={classes.loadingContainer}>
            <CircularProgress color="inherit" />
          </section>
        </Container>
      )
    }
    return (
      <div>
        <Container>
          <Helmet>
            <title>{topic.title}</title>
          </Helmet>
          <header className={classes.header}>
            <h3>{topic.title}</h3>
          </header>
          <section className={classes.body}>
            <p dangerouslySetInnerHTML={{ __html: marked(topic.content) }} />
          </section>
        </Container>

        <Paper elevation={4} className={classes.replies}>
          <header className={classes.replyHeader}>
            <span>{`${topic.reply_count} 回复`}</span>
            <span>{`最新回复 ${formatDate(topic.last_reply_at, 'yyyy年m月dd日')}`}</span>
          </header>
          {
            !user.isLogin ?
              <section className={classes.notLoginButton}>
                <Button variant="raised" color="secondary" onClick={this.goToLogin}>登录进行回复</Button>
              </section> :
              <section className={classes.replyEditor}>
                <textarea placeholder="添加你的精彩回复" className={classes.content} />
                <Button fab="true" color="secondary" className={classes.replyButton}>
                  <IconReply />
                </Button>
              </section>

          }
          <section>
            {
              topic.replies.map(reply => <Reply reply={reply} key={reply.id} />)
            }
          </section>
        </Paper>
      </div>
    )
  }
}

TopicDetail.wrappedComponent.propTypes = {
  user: PropTypes.object.isRequired,
  topicStore: PropTypes.object.isRequired,
}

TopicDetail.propTypes = {
  match: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
}

export default withStyles(topicDetailStyle)(TopicDetail)
