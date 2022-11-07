/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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

import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { ref } from '@nuxtjs/composition-api';

const ability = ref(createMongoAbility());

export const useVeoPermissions = () => {
  const updatePermissions = (permissions: string[]) => {
    const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);

    can('view', 'all');

    if (permissions.includes('veo-write')) {
      can('manage', 'all');
    } else {
      cannot('manage', 'all');
    }
    if (permissions.includes('veo-content-creator')) {
      can('view', 'editors');
      can('manage', 'editors');
    } else {
      cannot('view', 'editors');
      cannot('manage', 'editors');
    }

    if (permissions.includes('account:read')) {
      can('view', 'accounts');
    } else {
      cannot('view', 'accounts');
    }
    if (permissions.includes('account:manage')) {
      can('manage', 'accounts');
    } else {
      cannot('manage', 'accounts');
    }
    // @ts-ignore For some reason the rules and update types are incompatible, they work however
    ability.value.update(rules);
  };

  return { ability, updatePermissions };
};
