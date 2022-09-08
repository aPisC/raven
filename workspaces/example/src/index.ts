import { Raven } from 'raven'
import { RavenPluginKoa } from 'raven-plugin-koa'
import RavenPluginKoaAuth from 'raven-plugin-koa-auth'
import { RavenPluginSequelize } from 'raven-plugin-sequelize'

const server = new Raven()

// Database
server.usePlugin(RavenPluginSequelize).configure({
  dialect: 'sqlite',
  storage: ':memory:',
})

// Web engine and authorization
server.usePlugin(RavenPluginKoaAuth).configure({
  blockWithoutToken: false,
  defaultAuthorized: false,
  secret: 'jwt-secret',
})

server.usePlugin(RavenPluginKoa).configure((opt, config) => {
  opt.port = config.getRequired('server.port')
})

// Load loacal components
server.loadFiles({
  root: __dirname,
  controllers: ['controllers/*.{js,ts}'],
  models: ['models/*.{js,ts}'],
  config: ['../config/config.yaml', `../config/config.${process.env['NODE_ENV'] || 'development'}.yaml`],
})

//Start server
server.start()
