import consola, { Consola } from 'consola'
import { Plugin } from '@nuxt/types'

export type Logger = Consola

export default (function({ isDev }, inject) {
  const logger: Logger = consola.create({
    level: isDev ? 4 : 0,
    defaults: {

    }
  }).withTag('app')

  inject('logger', logger)
} as Plugin)
