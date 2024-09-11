/*
 * verinice.veo web
 * Copyright (C) 2024 Aziz Khalledi
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
// useDialogManager.ts
import { ref } from 'vue';

export function useDialogManager(props, hierarchicalContext: string) {
  const createObjectDialog = ref({
    value: false as boolean,
    objectType: undefined as undefined | string,
    hierarchicalContext: 'parent',
    parentScopeIds: undefined as undefined | string[]
  });

  const selectEntityDialog = ref(false);
  const speedDialIsOpen = ref(false);

  const createEntityDialog = ref({
    value: false,
    eventPayload: undefined as undefined | Record<string, any>
  });

  // Open create object dialog function, passing props dynamically when needed
  const openCreateObjectDialog = (objectType?: string) => {
    if (!objectType) {
      createEntityDialog.value = {
        value: true,
        eventPayload: { objectType, addAsChild: true }
      };
    } else {
      createObjectDialog.value = {
        objectType,
        value: true,
        hierarchicalContext: hierarchicalContext,
        parentScopeIds: props.object?.type === 'scope' ? [props.object?.id] : undefined
      };
    }
  };

  return {
    speedDialIsOpen,
    createObjectDialog,
    createEntityDialog,
    selectEntityDialog,
    openCreateObjectDialog
  };
}
