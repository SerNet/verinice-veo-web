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
  </div>
</template>

<script setup lang="ts">
import { mergeProps } from 'vue';
import { mdiDotsVertical, mdiTrashCanOutline } from '@mdi/js';

import { IVeoEntity } from '~/types/VeoTypes';
import { useLinkObject } from '~/composables/VeoObjectUtilities';
import { INestedMenuEntries } from '~/components/util/NestedMenu.vue';
import ObjectCreateDialog from '~/components/object/CreateDialog.vue';
import ObjectLinkDialog from '~/components/object/LinkDialog.vue';
import ObjectDeleteDialog from '~/components/object/DeleteDialog.vue';
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';

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
const { displayErrorMessage } = useVeoAlerts();

// Callbacks
const navigateToObjectOverview = () => {
  navigateTo({
    name: OBJECT_OVERVIEW_ROUTE_NAME,
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

const onCreateObjectSuccess = (newObjectId: string) => {
  if (props.object) {
    link(props.object, { type: 'process', id: newObjectId });
    emit('reload');
  }
};

// general stuff
const subType = computed(() => props.object?.domains[route.params.domain as string]?.subType);

const items = computed<(INestedMenuEntries & { objectTypes?: string[]; subTypes?: string[] })[]>(() => [
  {
    key: 'delete',
    title: t('deleteObject').toString(),
    icon: mdiTrashCanOutline,
    color: 'primary',
    component: ObjectDeleteDialog,
    componentProps: {
      item: props.object,
      onSuccess: navigateToObjectOverview,
      onError: (error: any) => displayErrorMessage(t('delteObjectFailed'), JSON.stringify(error))
    }
  },
  {
    key: 'dpia',
    title: t('dpia').toString(),
    children: [
      {
        key: 'create_dpia',
        title: t('createDPIA').toString(),
        component: ObjectCreateDialog,
        componentProps: {
          domainId: route.params.domain,
          objectType: 'process',
          subType: 'PRO_DPIA',
          onSuccess: onCreateObjectSuccess
        }
      },
      {
        key: 'link_dpia',
        title: t('linkDPIA').toString(),
        component: ObjectLinkDialog,
        componentProps: {
          object: props.object,
          preselectedFilters: { subType: 'PRO_DPIA' },
          onSuccess: () => emit('reload')
        }
      }
    ],
    objectTypes: ['process'],
    subTypes: ['PRO_DataProcessing']
  }
]);

// filter allowed actions for current object type & sub type
const visibleItems = computed(() =>
  items.value.filter((a) => props.object?.type && subType.value && (!a.objectTypes || a.objectTypes.includes(props.object?.type)) && (!a.subTypes || a.subTypes.includes(subType.value)))
);
</script>

<i18n>
{
  "en": {
    "createDPIA": "create DPIA",
    "deleteObject": "delete object",
    "deleteObjectFailed": "Deleting the object failed",
    "dpia": "DPIA",
    "linkDPIA": "link DPIA"
  },
  "de": {
    "createDPIA": "DSFA erstellen",
    "deleteObject": "Objekt löschen",
    "deleteObjectFailed": "Das Objekt konnte nicht gelöscht werden",
    "dpia": "DSFA",
    "linkDPIA": "DSFA auswählen"
  }
}
</i18n>
