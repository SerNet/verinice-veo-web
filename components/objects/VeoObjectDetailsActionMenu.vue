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
    <VeoNestedMenu
      bottom
      right
      offset-y
      :items="visibleItems"
    >
      <template #activator="{ on }">
        <v-btn
          :disabled="!visibleItems.length"
          fab
          text
          small
          v-on="on"
        >
          <v-icon>
            {{ mdiDotsVertical }}
          </v-icon>
        </v-btn>
      </template>
    </VeoNestedMenu>
    <!-- dialogs -->
    <VeoCreateObjectDialog
      v-model="createObjectDialogVisible"
      :domain-id="domainId"
      object-type="process"
      sub-type="PRO_DPIA"
      @success="onCreateObjectSuccess"
    />
    <VeoLinkObjectDialog
      v-model="linkObjectDialogVisible"
      add-type="entity"
      :edited-object="object"
      :hierarchical-context="'child'"
      :preselected-filters="{ subType: 'PRO_DPIA' }"
      @success="$emit('reload')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, useRoute, ref, computed, PropType } from '@nuxtjs/composition-api';
import { pick, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiDotsVertical, mdiAlertOutline, mdiExclamationThick } from '@mdi/js';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';
import { useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';
import { INestedMenuEntries } from '~/components/layout/VeoNestedMenu.vue';

export default defineComponent({
  name: 'VeoObjectDetailsActionMenu',
  props: {
    object: {
      type: Object as PropType<IVeoEntity | undefined>,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const { linkObject } = useVeoObjectUtilities();

    // general stuff
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const subType = computed(() => props.object?.domains[domainId.value]?.subType);

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
        linkObject('child', pick(props.object, 'id', 'type'), { type: 'process', id: newObjectId });
        emit('reload');
      }
    };

    return {
      domainId,
      createObjectDialogVisible,
      linkObjectDialogVisible,
      onCreateObjectSuccess,

      t,
      upperFirst,
      visibleItems,
      mdiDotsVertical,
      mdiAlertOutline,
      mdiExclamationThick
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
