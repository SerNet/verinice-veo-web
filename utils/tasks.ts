/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import { mdiAutorenew, mdiClipboardCheckOutline } from '@mdi/js';

import type { VeoTaskType } from '~/types/VeoTask';

export const TASK_TYPE_ICONS = new Map<VeoTaskType, string>([
  ['requirement-implementation', mdiClipboardCheckOutline],
  ['requirement-implementation-revision', mdiAutorenew]
]);

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDeadline(deadline?: string): Date | undefined {
  if (!deadline || !ISO_DATE_PATTERN.test(deadline)) return undefined;

  const [year, month, day] = deadline.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return isNaN(date.getTime()) ? undefined : date;
}

export function isTaskOverdue(deadline?: string, now: Date = new Date()): boolean {
  const date = parseDeadline(deadline);
  if (!date) return false;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return date.getTime() < today.getTime();
}

export function getDeadlineColor(deadline?: string, now: Date = new Date()): 'error' | 'warning' {
  return isTaskOverdue(deadline, now) ? 'error' : 'warning';
}

export function getTaskIcon(type: VeoTaskType): string {
  return TASK_TYPE_ICONS.get(type) ?? mdiClipboardCheckOutline;
}
