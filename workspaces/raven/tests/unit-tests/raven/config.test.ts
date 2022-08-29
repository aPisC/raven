import { ConfigObjectProvider } from '../../../src/config/config-object-provider'

describe('Test config store', () => {
  test('Set values', () => {
    const config = new ConfigObjectProvider()

    config.set('key1', 'value0')
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

  test('Set remove entries', () => {
    const config = new ConfigObjectProvider()

    config.set('key1', 'value1')
    config.set('key2', { k2_1: 1, k2_2: true })
    config.set({ key2: null, key4: false })
    config.set('key1', 'value2')
    config.set('key1', null)

    expect(config.values).toEqual({
      key4: false,
    })
  })

  test('Set config throws error', () => {
    const config = new ConfigObjectProvider()

    config.set('key1', 'value1')
    config.set('key2', { k2_1: 1, k2_2: true })

    expect(() => config.set('key2', 'conflict')).toThrow()
    expect(() => config.set('key1', { a: 1 })).toThrow()
  })

  test('Get values', () => {
    const config = new ConfigObjectProvider()

    config.set('key1', 'value1')
    config.set('key2', { k2_1: 1, k2_2: true })
    config.set({ key4: false })

    expect(config.get('key2.k2_1')).toBe(1)
    expect(config.get('key2.k2_2')).toBe(true)
    expect(config.get('key4')).toBe(false)
    expect(config.get('missing')).toBeUndefined()
    expect(config.get('missing2', 123)).toBe(123)
  })

  test('Get from section', () => {
    const config = new ConfigObjectProvider({
      'section.key1': 1,
      'section.key2': 2,
      'section.key3': 3,
      'section.nested.value': true,
      'other.key4': 4,
      parent: 5,
    })

    const section = config.getSection('section')

    expect(section.get('key1')).toBe(1)
    expect(section.get('key2')).toBe(2)
    expect(section.get('key3')).toBe(3)
    expect(section.get('nested.value')).toBe(true)
    expect(section.getSection('nested').get('value')).toBe(true)
    expect(section.get('other.key4')).toBeUndefined()
    expect(section.get('parent')).toBeUndefined()
    expect(section.get('section.key1')).toBeUndefined()
  })

  test('Set trough section', () => {
    const config = new ConfigObjectProvider({
      'section.nested.value': true,
      'section.nested2.value': false,
      'other.key4': 4,
      parent: 5,
    })

    const section = config.getSection('section')
    section.set('nested2', null)
    config.getSection('section2').set({ key: 'value' })

    expect(section.get('nested.value')).toBe(true)
    expect(section.get('nested2.value')).toBeUndefined()
    expect(config.get('section2.key')).toBe('value')
    expect(section.getSection('nested').get('value')).toBe(true)
  })
})
