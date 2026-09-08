/*
 * verinice.veo web
 * Copyright (C) 2026 Djordje Mirosavljevic
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';

import TaskCard from '~/components/task/Card.vue';
import TaskList from '~/components/task/List.vue';
import type { IVeoTask } from '~/types/VeoTask';

const task: IVeoTask = {
  type: 'requirement-implementation',
  requirementImplementation: {
    origin: {
      displayName: 'Target',
      targetUri: '/assets/target-id'
    },
    control: {
      displayName: 'Control',
      targetUri: '/controls/control-id'
    },
    status: 'UNKNOWN',
    origination: 'SYSTEM_SPECIFIC',
    _self: '/assets/target-id/requirement-implementations/control-id'
  }
};

describe('TaskCard', () => {
  it('emits a click event', async () => {
    const onClick = vi.fn();
    const card = (await mountSuspended(TaskCard, { props: { task, onClick } })).get('[data-veo-test="task-card"]');

    await card.trigger('click');

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards the selected task through the task list', async () => {
    const onClick = vi.fn();
    const card = (await mountSuspended(TaskList, { props: { tasks: [task], onClick } })).get(
      '[data-veo-test="task-card"]'
    );

    await card.trigger('click');

    expect(onClick).toHaveBeenCalledWith(task);
  });
});
