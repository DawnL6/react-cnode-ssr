const axios = require('axios')
const webpack = require('webpack')
const path = require('path')
const proxy = require('http-proxy-middleware')
const MemoryFs = require('memory-fs')
const ReactDOMServer = require('react-dom/server')
const serverConfig = require('../../build/webpack.config.server')

const getTempalte = () => {
    return new Promise((resolve, reject) => {
        axios.get('http://localhost:8888/public/index.html')
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const Module = module.constructor

const mfs = new MemoryFs
const serverCompiler = webpack(serverConfig)
let serverBundel
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
})
module.exports = function (app) {

    app.use('/public', proxy({
        target: 'http://localhost:8888'
    }))

    app.get('*', function (req, res) {
        getTempalte().then(template => {
            const content = ReactDOMServer.renderToString(serverBundel)
            res.send(template.replace('<!-- app -->', content))
        })
    })
}
