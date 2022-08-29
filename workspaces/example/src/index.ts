import { Raven } from 'raven'

const server = new Raven()

server.usePlugin('raven-plugin-auth')

server.loadFiles({
  root: __dirname,
  controllers: ['controllers/*.ts'],
  models: ['models/*.ts'],
  config: ['config.yaml'],
})

server.start()
