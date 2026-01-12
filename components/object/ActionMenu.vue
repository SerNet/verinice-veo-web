<!--
   - verinice.veo web
   - Copyright (C) 2022  Jessica Lühnen, Jonas Heitmann
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div class="mb-3" style="position: relative">
    <component
      :is="currentTabComponent"
      :object="object"
      :disabled="disabled"
      @reload="handleReload"
      @parent-create-success="onCreateObjectSuccess"
      @child-create-success="onCreateObjectSuccess"
    >
      <template #default="{ actions }">
        <v-btn
          v-if="actions.length === 1"
          :icon="mdiPlus"
          :disabled="disabled || !ability.can('manage', subject('units', { id: route.params.unit }))"
          class="veo-primary-action-fab mr-2"
          color="primary"
          data-component-name="object-details-actions-button"
          data-veo-test="object-details-actions-button"
          :aria-label="actions[0].title.value"
          :title="actions[0].title.value"
          @click="actions[0].action()"
        />
        <!-- Fallback for multiple actions (backward compatibility) -->
        <v-menu v-else-if="actions.length > 1" v-model="speedDialIsOpen" location="top left">
          <template #activator="{ props: menuProps }">
            <v-btn
              :icon="speedDialIsOpen && !disabled && actions.length ? mdiClose : mdiPlus"
              :disabled="
                !actions.length || disabled || !ability.can('manage', subject('units', { id: route.params.unit }))
              "
              class="veo-primary-action-fab mr-2"
              color="primary"
              data-component-name="object-details-actions-button"
              data-veo-test="object-details-actions-button"
              :aria-label="t('add')"
              v-bind="menuProps"
            />
          </template>
          <template v-if="actions.length && !disabled" #default>
            <v-list data-veo-test="object-action-menu-list">
              <v-list-item
                v-for="action in actions"
                :key="action.key"
                :title="action.title.value"
                :prepend-icon="action.icon"
                density="compact"
                data-veo-test="action-selection-nav-item"
                @click="action.action"
              />
            </v-list>
          </template>
        </v-menu>
      </template>
    </component>

    <v-btn
      v-if="type === 'links'"
      :icon="mdiPlus"
      :disabled="true"
      class="veo-primary-action-fab mr-2"
      color="primary"
      :aria-label="t('add')"
      data-component-name="object-details-actions-button"
      data-veo-test="object-details-actions-button"
    />
  </div>
</template>

<script lang="ts">
import { mdiClose, mdiPlus } from '@mdi/js';
import type { PropType } from 'vue';
import ObjectActionMenusChildObjectsTab from '~/components/object/actionMenus/ChildObjectsTab.vue';
import ObjectActionMenusParentObjectsTab from '~/components/object/actionMenus/ParentObjectsTab.vue';
import ObjectActionMenusRisksTab from '~/components/object/actionMenus/RisksTab.vue';
import ObjectActionMenusTargetsTab from '~/components/object/actionMenus/TargetsTab.vue';
import ObjectActionMenusControlsTab from '~/components/object/actionMenus/ControlsTab.vue';

import type { IVeoEntity } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    type: {
      type: String,
      default: ''
    },
    object: {
      type: Object as PropType<IVeoEntity | undefined>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reload'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const speedDialIsOpen = ref(false);
    const { ability, subject } = useVeoPermissions();

    const handleReload = () => {
      emit('reload');
    };
    const currentTabComponent = computed(() => {
      const componentsMap: Record<string, any> = {
        childObjects: ObjectActionMenusChildObjectsTab,
        parentObjects: ObjectActionMenusParentObjectsTab,
        controls: ObjectActionMenusControlsTab,
        risks: ObjectActionMenusRisksTab,
        targets: ObjectActionMenusTargetsTab
      };
      return componentsMap[props.type];
    });

    const onCreateObjectSuccess = (_newObjectId: string) => {
      handleReload();
    };

    provide('t', t);
    return {
      currentTabComponent,
      handleReload,
      speedDialIsOpen,
      t,
      mdiClose,
      mdiPlus,
      onCreateObjectSuccess,
      ability,
      subject,
      route
    };
  }
});
</script>

<i18n src="~/locales/base/components/object-action-menu.json"></i18n>

<style lang="scss" scoped>
:deep(.v-speed-dial__list) {
  align-items: flex-end !important;
  text-align: right;
}
</style>
