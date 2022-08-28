import { Config } from '../../../src/config/config'

describe('Test config store', () => {
  test('Set values', () => {
    const config = new Config()

    config.set('key1', 'value1')
    config.set('key2', { k2_1: 1, k2_2: true })
    config.set({ key3: 'val3', key4: false })

    expect(config.values).toEqual({
      key1: 'value1',
      'key2.k2_1': 1,
      'key2.k2_2': true,
      key3: 'val3',
      key4: false,
    })
  })

  test('Set remove', () => {
    const config = new Config()

    config.set('key1', 'value1')
    config.set('key2', { k2_1: 1, k2_2: true })
    config.set({ key2: null, key4: false })

    expect(config.values).toEqual({
      key1: 'value1',
      key4: false,
    })
  })
})
