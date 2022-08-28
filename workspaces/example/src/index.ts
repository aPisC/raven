import { MiddlewarePriority, Raven } from 'raven'

const server = new Raven()
server.config.port = 3001
server.config['plugins.raven-plugin-auth'] = {
  secret: 'asd',
}

server.loadFiles({
  root: __dirname,
  controllers: ['controllers/*.ts'],
  models: ['models/*.ts'],
})
server.useKoaMiddleware(MiddlewarePriority.PostIngress, () => {})

server.usePlugin('raven-plugin-auth')
server.start()
