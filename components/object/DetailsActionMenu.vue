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
      location="bottom left"
      :items="visibleItems"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="mergeProps($attrs, menuProps)"
          :disabled="!visibleItems.length || $props.disabled"
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
      v-if="object"
      v-model="linkObjectDialogVisible"
      :object="object"
      :preselected-filters="{ subType: 'PRO_DPIA' }"
      @success="$emit('reload')"
    />
    <ObjectDeleteDialog
      v-model="deleteObjectDialogVisible"
      :item="object"
      @success="navigateToObjectOverview"
      @success123="navigateToObjectOverview"
    />
  </div>
</template>

<script setup lang="ts">
import { mergeProps } from 'vue';
import { mdiDotsVertical, mdiTrashCanOutline } from '@mdi/js';

import { IVeoEntity } from '~/types/VeoTypes';
import { useLinkObject } from '~/composables/VeoObjectUtilities';
import { INestedMenuEntries } from '~/components/util/NestedMenu.vue';

const props = withDefaults(defineProps<{
  disabled: boolean;
  object: IVeoEntity | undefined;
}>(), {
  disabled: false,
  object: undefined
});

const emit = defineEmits<{
  (event: 'reload'): void;
}>();

const { t } = useI18n();
const route = useRoute();
const { link } = useLinkObject();

// general stuff
const subType = computed(() => props.object?.domains[route.params.domain as string]?.subType);

const items: (INestedMenuEntries & { objectTypes?: string[]; subTypes?: string[] })[] = [
  {
    key: 'delete',
    title: t('deleteObject').toString(),
    icon: mdiTrashCanOutline,
    color: 'primary',
    action: () => {
      deleteObjectDialogVisible.value = true;
    }
  },
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
  items.filter((a) => props.object?.type && subType.value && (!a.objectTypes || a.objectTypes.includes(props.object?.type)) && (!a.subTypes || a.subTypes.includes(subType.value)))
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

const deleteObjectDialogVisible = ref(false);
const navigateToObjectOverview = () => {
  navigateTo({
    name: 'unit-domains-domain-objects',
    params: {
      domain: route.params.domain,
      unit: route.params.unit
    },
    query: {
      objectType: props.object?.type,
      subType: props.object?.domains[route.params.domain as string]?.subType
    }
  });
};
</script>

<i18n>
{
  "en": {
    "createDPIA": "create DPIA",
    "deleteObject": "delete object",
    "dpia": "DPIA",
    "linkDPIA": "link DPIA"
  },
  "de": {
    "createDPIA": "DSFA erstellen",
    "deleteObject": "Objekt löschen",
    "dpia": "DSFA",
    "linkDPIA": "DSFA auswählen"
  }
}
</i18n>
