/*
 * verinice.veo web
 * Copyright (C) 2026  Aziz Khalledi
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
import type { VNodeChild } from 'vue';
import { RouterLink } from 'vue-router';

import { VeoElementTypePlurals } from '~/types/VeoTypes';

export interface ObjectPathTarget {
  id?: string;
  type?: string;
  subType?: string;
}

export function getObjectDetailPath(
  target: ObjectPathTarget | undefined,
  params: { unit?: string; domain?: string }
): string | undefined {
  const endpoint = VeoElementTypePlurals[target?.type as keyof typeof VeoElementTypePlurals];

  if (!target?.id || !endpoint || !params.unit || !params.domain) {
    return undefined;
  }

  return `/${params.unit}/domains/${params.domain}/${endpoint}/${target.subType || '-'}/${target.id}/`;
}

export function renderObjectLink(
  children: VNodeChild,
  target: ObjectPathTarget | undefined,
  params: { unit?: string; domain?: string },
  options: { bold?: boolean; class?: string } = {}
): VNode {
  const to = getObjectDetailPath(target, params);
  const style = options.bold ? { fontWeight: 'bold' } : {};

  if (!to) return h('span', { style }, children as any);

  return h(
    RouterLink,
    {
      class: ['veo-element-link', 'd-block', options.class].filter(Boolean).join(' '),
      style: { color: 'inherit', textDecoration: 'none', ...style },
      to,
      onClick: (e: MouseEvent) => e.stopPropagation()
    },
    () => children
  );
}
