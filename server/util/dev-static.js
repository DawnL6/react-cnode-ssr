const axios = require('axios')
const webpack = require('webpack')
const path = require('path')
const proxy = require('http-proxy-middleware')
const MemoryFs = require('memory-fs')
const ejs = require('ejs')
const serialize = require('serialize-javascript')
const bootstrap = require('react-async-bootstrapper')
const ReactDOMServer = require('react-dom/server')
const serverConfig = require('../../build/webpack.config.server')

const getTempalte = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/server.ejs')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

const Module = module.constructor

const mfs = new MemoryFs
const serverCompiler = webpack(serverConfig)
let serverBundel, createStoreMap
serverCompiler.outputFileSystem = mfs
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err
  stats = stats.toJson()
  stats.errors.forEach(err => console.error(err))
  stats.warnings.forEach(warn => console.warn(warn))

  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )

  const bundle = mfs.readFileSync(bundlePath, 'utf-8')
  const m = new Module()
  m._compile(bundle, 'server-entry.js')
  serverBundel = m.exports.default
  createStoreMap = m.exports.createStoreMap
})
module.exports = function (app) {

  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  const getStoreState = (stores) => {
    return Object.keys(stores).reduce((result, storeName) => {
      result[storeName] = stores[storeName].toJson()
      return result
    }, {})
  }

  app.get('*', function (req, res) {
    getTempalte().then(template => {
      const routerContext = {}
      const stores = createStoreMap()
      const app = serverBundel(stores, routerContext, req.url)
      bootstrap(app).then(() => {
        if (routerContext.url) {
          res.status(302).setHeader('Location', routerContext.url)
          res.end()
          return
        }
        const state = getStoreState(stores)
        const content = ReactDOMServer.renderToString(app)
        const html = ejs.render(template, {
          appString: content,
          initialState: serialize(state)
        })
        res.send(html)
      })

    })
  })
}
