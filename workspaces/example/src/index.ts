import { Raven } from 'raven'
import RavenPluginAuth from 'raven-plugin-auth'

const server = new Raven()

server.usePlugin<RavenPluginAuth>('raven-plugin-auth').configure({
  blockWithoutToken: false,
  defaultAuthorized: false,
})

server.loadFiles({
  root: __dirname,
  controllers: ['controllers/*.ts'],
  models: ['models/*.ts'],
  config: ['config/config.yaml', `config/config.${process.env['NODE_ENV'] || 'development'}.yaml`],
})

server.start()
