import {
  observable,
  action,
  extendObservable,
  computed,
  toJS,
} from 'mobx'

import {
  get,
} from '../util/http'

import {
  topicSchema,
} from '../util/variable-define'

const createTopic = (topic) => {
  return Object.assign({}, topicSchema, topic)
}

class Topic {
  constructor(data) {
    extendObservable(this, data)
  }
  @observable syncing = false
}

class TopicStore {
  @observable topics
  @observable details
  @observable syncing
  @observable tab

  constructor({ syncing = false, topics = [], tab = null, details = [] } = {}) {
    this.syncing = syncing
    this.topics = topics.map(topic => new Topic(createTopic(topic)))
    this.details = details.map(topic => new Topic(createTopic(topic)))
    this.tab = tab
  }

  addTopic(topic) {
    this.topics.push(new Topic(createTopic(topic)))
  }

  @computed get detailMap() {
    return this.details.reduce((result, detail) => {
      result[detail.id] = detail
      return result
    }, {})
  }

  @action fetchTopics(tab) {
    return new Promise((resolve, reject) => {
      if (tab === this.tab && this.topics.length > 0) {
        resolve()
      } else {
        this.tab = tab
        this.syncing = true
        this.topics = []
        get('/topics', {
          mdrender: false,
          tab,
        }).then((resp) => {
          if (resp.success) {
            const topics = resp.data.map((topic) => {
              return new Topic(createTopic(topic))
            })
            this.topics = topics
            this.syncing = false
            resolve()
          } else {
            reject()
          }
          this.syncing = false
        }).catch((err) => {
          reject(err)
          this.syncing = false
        })
      }
    })
  }

  @action getTopicDetail(id) {
    return new Promise((resolve, reject) => {
      console.log(this.detailMap[id])
      if (this.detailMap[id]) {
        resolve(this.detailMap[id])
      } else {
        get(`/topic/${id}`, {
          mdrender: false,
        }).then((resp) => {
          if (resp.success) {
            const topic = new Topic(createTopic(resp.data), true)
            this.details.push(topic)
            resolve(topic)
          } else {
            reject()
          }
        }).catch((err) => {
          reject(err)
        })
      }
    })
  }
  toJson() {
    return {
      topics: toJS(this.topics),
      syncing: this.syncing,
      tab: this.tab,
    }
  }
}

export default TopicStore
