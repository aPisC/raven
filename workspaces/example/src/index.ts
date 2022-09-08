import { KoaPlugin, Raven, SequelizePlugin } from 'raven'
import RavenPluginAuth from 'raven-plugin-auth'

const server = new Raven()

server.usePlugin(SequelizePlugin)

server.usePlugin<RavenPluginAuth>('raven-plugin-auth').configure({
  blockWithoutToken: false,
  defaultAuthorized: false,
  secret: 'asd',
})
server.usePlugin(KoaPlugin)

server.loadFiles({
  root: __dirname,
  controllers: ['controllers/*.{js,ts}'],
  models: ['models/*.{js,ts}'],
  config: ['../config/config.yaml', `../config/config.${process.env['NODE_ENV'] || 'development'}.yaml`],
})

server.start()
