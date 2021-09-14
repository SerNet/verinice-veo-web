/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann
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
import { Middleware } from '@nuxt/types';
import { separateUUIDParam } from '~/lib/utils';

/**
 * This file updates the current user and domain in order to get used at different places in the app (mainly #249)
 */
export default (function ({ route, $user }) {
  const newUnit = separateUUIDParam(route.params.unit).id;
  const newDomain = separateUUIDParam(route.params.domain).id;

  if ($user.lastUnit !== newUnit) {
    $user.updateLastUnit(newUnit);
  } else {
    // Only update domain if set (if it is undefined, don't overwrite, as we want to use the stored domain)
    // eslint-disable-next-line no-lonely-if
    if (newDomain && newDomain !== $user.lastDomain) {
      // we dont't want to persist this domain, as it is more of a placeholder
      if (newDomain !== 'more') {
        $user.updateLastDomain(newDomain);
      }
    }
  }
} as Middleware);
