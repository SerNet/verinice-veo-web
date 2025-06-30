/*
 * verinice.veo web
 * Copyright (C) 2025 Gerrit Krüger
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

import type { VeoSearchFilters } from '~/types/VeoSearch';

function buildSubtypes(subTypes: any, objectType: string) {
  if (subTypes === undefined) return {};

  const newList = {};

  subTypes.value.forEach((item) => {
    const text = `${objectType}_${item}_plural`;
    newList[item] = { text: text, value: item };
  });

  return newList;
}

function buildSelection(items: any) {
  if (items === undefined) return {};

  const newList = {};

  items.forEach((item) => {
    if (typeof item !== 'string') newList[item[1]] = { text: item[0], value: item[1] };
    else newList[item] = { value: item };
  });

  return newList;
}

export function useSearchFilters(filter): {
  data: ComputedRef<VeoSearchFilters>;
} {
  const { data: currentDomain } = useCurrentDomain();
  const subTypes = computed(() =>
    Object.keys(currentDomain.value?.raw?.elementTypeDefinitions?.[filter.value?.objectType]?.subTypes || {})
  );

  const data = computed(() => ({
    all: {
      name: {},
      abbreviation: {},
      displayName: {},
      designator: {},
      status: {
        selection: buildSelection(['NEW', 'RELEASED', 'IN_PROGRESS', 'FOR_REVIEW', 'ARCHIVED'])
      },
      subType: {
        selection: buildSubtypes(subTypes, filter.value?.objectType ?? undefined)
      },
      hasParentElements: {
        selection: buildSelection([
          ['yes', true],
          ['no', false]
        ])
      },
      hasChildElements: {
        selection: buildSelection([
          ['yes', true],
          ['no', false]
        ])
      }
    },
    default: 'name'
  }));

  return { data };
}
