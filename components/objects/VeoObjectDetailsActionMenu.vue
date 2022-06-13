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
    <v-menu
      bottom
      right
      offset-y
    >
      <template #activator="{ on }">
        <v-btn
          :disabled="!allowedActions.length"
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
      <v-list class="py-0">
        <v-list-item
          v-for="action in allowedActions"
          :key="action.key"
          @click="action.action"
        >
          <v-list-item-title>
            {{ upperFirst(t(action.key).toString()) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <!-- dialogs -->
    <VeoCreateObjectDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="domainId"
      :object-type="createObjectDialog.objectType"
      :sub-type="createObjectDialog.subType"
      @success="onCreateObjectSuccess"
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

    // configure possible action items
    const actions = [
      {
        key: 'createDPIA',
        objectTypes: ['process'],
        subTypes: ['PRO_DataProcessing'],
        action: () => onCreateDPIA()
      }
    ];

    // filter allowed actions for current object type & sub type
    const allowedActions = computed(() =>
      actions.filter((a) => props.object?.type && subType.value && a.objectTypes.includes(props.object?.type) && a.subTypes.includes(subType.value))
    );

    // dialog stuff
    const createObjectDialog = ref({
      value: false as boolean,
      objectType: undefined as undefined | string,
      subType: undefined as undefined | string
    });

    const onCreateDPIA = () => {
      createObjectDialog.value.objectType = props.object?.type;
      createObjectDialog.value.subType = 'PRO_DPIA';
      createObjectDialog.value.value = true;
    };

    // emit after new object creation for linking
    const onCreateObjectSuccess = (newObjectId: string) => {
      if (props.object) {
        linkObject('child', pick(props.object, 'id', 'type'), { type: createObjectDialog.value.objectType as string, id: newObjectId });
        emit('reload');
      }
    };

    return {
      domainId,
      allowedActions,
      createObjectDialog,
      onCreateObjectSuccess,

      t,
      upperFirst,
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
    "createDPIA": "create PIA"
  },
  "de": {
    "createDPIA": "DSFA erstellen"
  }
}
</i18n>
