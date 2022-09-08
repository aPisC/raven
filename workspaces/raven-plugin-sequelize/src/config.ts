import { SequelizeOptions } from 'sequelize-typescript'

export interface Config extends Omit<SequelizeOptions, 'models' | 'repositoryMode'> {}

export const defaultConfig: Partial<Config> = {}
