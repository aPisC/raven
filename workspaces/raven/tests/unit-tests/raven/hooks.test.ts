import { Raven } from '../../../src/raven/raven'

describe('Test hooks', () => {
  test('dependencies passed to hook classes', () => {
    const server = new Raven()

    expect(server.hooks.initialize.raven).toBe(server)
  })
})
