<!--
   - verinice.veo web
   - Copyright (C) 2022  Jessica Lühnen
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
  <div>
    <UtilNestedMenu
      bottom
      right
      offset-y
      :items="visibleItems"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="mergeProps($attrs, props)"
          :disabled="!visibleItems.length || disabled"
          :icon="mdiDotsVertical"
          variant="text"
          size="small"
        />
      </template>
    </UtilNestedMenu>
    <!-- dialogs -->
    <ObjectCreateDialog
      v-model="createObjectDialogVisible"
      :domain-id="($route.params.domain as string)"
      object-type="process"
      sub-type="PRO_DPIA"
      @success="onCreateObjectSuccess"
    />
    <ObjectLinkDialog
      v-model="linkObjectDialogVisible"
      :object="object"
      :preselected-filters="{ subType: 'PRO_DPIA' }"
      @success="$emit('reload')"
    />
  </div>
</template>

<script lang="ts">
import { mergeProps, PropType } from 'vue';
import { upperFirst } from 'lodash';
import { mdiDotsVertical } from '@mdi/js';

import { IVeoEntity } from '~/types/VeoTypes';
import { useLinkObject } from '~/composables/VeoObjectUtilities';
import { INestedMenuEntries } from '~/components/util/NestedMenu.vue';

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    object: {
      type: Object as PropType<IVeoEntity | undefined>,
      default: undefined
    }
  },
  emits: ['reload'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const { link } = useLinkObject();

    // general stuff
    const subType = computed(() => props.object?.domains[route.params.domain as string]?.subType);

    const items: (INestedMenuEntries & { objectTypes: string[]; subTypes: string[] })[] = [
      {
        key: 'dpia',
        title: t('dpia').toString(),
        children: [
          {
            key: 'create_dpia',
            title: t('createDPIA').toString(),
            action: () => {
              createObjectDialogVisible.value = true;
            }
          },
          {
            key: 'link_dpia',
            title: t('linkDPIA').toString(),
            action: () => {
              linkObjectDialogVisible.value = true;
            }
          }
        ],
        objectTypes: ['process'],
        subTypes: ['PRO_DataProcessing']
      }
    ];

    // filter allowed actions for current object type & sub type
    const visibleItems = computed(() =>
      items.filter((a) => props.object?.type && subType.value && a.objectTypes.includes(props.object?.type) && a.subTypes.includes(subType.value))
    );

    // dialog stuff
    const linkObjectDialogVisible = ref(false);
    const createObjectDialogVisible = ref(false);

    // emit after new object creation for linking
    const onCreateObjectSuccess = (newObjectId: string) => {
      if (props.object) {
        link(props.object, { type: 'process', id: newObjectId });
        emit('reload');
      }
    };

    return {
      createObjectDialogVisible,
      linkObjectDialogVisible,
      onCreateObjectSuccess,

      mergeProps,
      t,
      upperFirst,
      visibleItems,
      mdiDotsVertical
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createDPIA": "create DPIA",
    "dpia": "DPIA",
    "linkDPIA": "link DPIA"
  },
  "de": {
    "createDPIA": "DSFA erstellen",
    "dpia": "DSFA",
    "linkDPIA": "DSFA auswählen"
  }
}
</i18n>
