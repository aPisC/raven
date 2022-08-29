import { Raven } from 'raven'

const server = new Raven()
console.log(process.env['NODE_ENV'])
server.usePlugin('raven-plugin-auth')

server.loadFiles({
  root: __dirname,
  controllers: ['controllers/*.ts'],
  models: ['models/*.ts'],
  config: ['config/config.yaml', `config/config.${process.env['NODE_ENV'] || 'development'}.yaml`],
})

server.start()
