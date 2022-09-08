import { RequireMap } from './types'

export const defaultRequireMap: RequireMap = {
  '.js': require,
  '.ts': require,
  '.d.ts': null,
  '.ts.map': null,
  '.js.map': null,
}
