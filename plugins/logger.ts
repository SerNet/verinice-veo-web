/*
 * verinice.veo web
 * Copyright (C) 2021  Markus Werner
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import consola, { Consola } from 'consola';
import { Plugin } from '@nuxt/types';

export type Logger = Consola;

export default (function ({ isDev }, inject) {
  const logger: Logger = consola
    .create({
      level: isDev ? 4 : 0,
      defaults: {}
    })
    .withTag('app');

  inject('logger', logger);
} as Plugin);
