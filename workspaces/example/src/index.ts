import { Raven } from 'raven'
import { RavenKoaPlugin } from 'raven-plugin-koa'
import RavenJWTAuthPlugin from 'raven-plugin-koa-auth'
import { RavenSequelizePlugin } from 'raven-plugin-sequelize'

const server = new Raven()

server.configure({
  database: {
    dialect: 'sqlite',
    storage: ':memory:',
  },
  auth: {
    passthrough: true,
    defaultAuthorized: false,
    secret: 'jwt-secret',
  },
  server: {
    port: 3000,
  },
})

// Database
server.usePlugin(RavenSequelizePlugin).configureFrom('database')

// Web engine and authorization
server.usePlugin(RavenKoaPlugin).configureFrom('server')

server.usePlugin(RavenJWTAuthPlugin).configureFrom('auth')

// Load loacal components
server.loadFiles({
  root: __dirname,
  controllers: ['controllers/*'],
  models: ['models/*.{js,ts}'],
  config: ['../config/config.yaml', `../config/config.${process.env['NODE_ENV'] || 'development'}.yaml`],
})

//Start server
server.start()
