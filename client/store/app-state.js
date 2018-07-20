import {
  observable,
  action,
  toJS,
} from 'mobx'
import { notify } from 'react-notify-toast'
import { post, get } from '../util/http'

export default class AppState {
  @observable user = {
    isLogin: false,
    info: {},
    detail: {
      syncing: false,
      recent_topics: [],
      recent_replies: [],
    },
    collections: {
      syncing: false,
      list: [],
    },
  }

  init({ user }) {
    if (user) {
      this.user = user
    }
  }

  @action login(accessToken) {
    return new Promise((resolve, reject) => {
      post('user/login', {}, {
        accessToken,
      }).then((resp) => {
        if (resp.success) {
          this.user.isLogin = true
          this.user.info = resp.data

          resolve()
          notify.show('Toasty!')
        } else {
          reject(resp)
        }
      }).catch(reject)
    })
  }

  @action getUserDetail() {
    this.user.detail.syncing = true
    return new Promise((resolve, reject) => {
      get(`user/${this.user.info.loginName}`)
        .then((resp) => {
          if (resp.success) {
            this.user.detail.recent_replies = resp.data.recent_replies
            this.user.detail.recent_topics = resp.data.recent_topics
            resolve()
          } else {
            reject(resp.msg)
          }
          this.user.detail.syncing = false
        }).catch((err) => {
          reject(err.message)
          this.user.detail.syncing = false
        })
    })
  }

  @action getUserCollection() {
    this.user.collections.syncing = true
    return new Promise((resolve, reject) => {
      get(`topic_collect/${this.user.info.loginName}`)
        .then((resp) => {
          if (resp.success) {
            this.user.collections.list = resp.data
            resolve()
          } else {
            reject(resp.msg)
          }
          this.user.collections.syncing = false
        }).catch((err) => {
          reject(err.message)
          this.user.collections.syncing = false
        })
    })
  }

  toJson() {
    return {
      user: toJS(this.user),
    }
  }
}
