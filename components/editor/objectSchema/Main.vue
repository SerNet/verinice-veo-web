<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
  <div
    class="fill-width"
    style="display: contents;"
  >
    <v-expansion-panels
      accordion
      multiple
      :model-value="expansionPanels"
      flat
    >
      <v-expansion-panel>
        <v-expansion-panel-title
          class="overline"
        >
          {{ globalT('editor.basicproperties') }} ({{ basicProps.length }})
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card outlined>
            <v-list
              class="py-0"
              dense
              disabled
            >
              <EditorObjectSchemaListItem
                v-for="(child, index) of basicProps"
                v-show="attributeContainsTitle(child.item, search)"
                :key="index"
                :title="child.item.title"
                :description="child.item.description"
                :styling="child.styling"
                two-line
                translate
              />
            </v-list>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="overline">
          {{ globalT('editor.customaspects') }} ({{ customAspects.length }})
          <div class="d-flex">
            <v-spacer />
            <v-btn
              small
              text
              color="primary"
              variant="text"
              @click.stop="showAddDialog('aspect')"
            >
              <v-icon
                size="small"
                :icon="mdiPlus"
              />
              <span>{{ globalT('editor.customaspects.add') }}</span>
            </v-btn>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card
            v-for="(aspect, index) of customAspects"
            v-show="
              (!hideEmptyAspects || aspect.item.attributes.length > 0) && itemContainsAttributeTitle(aspect, search)
            "
            :key="index"
            class="mb-2 overflow-hidden"
            outlined
          >
            <v-list class="py-0">
              <EditorObjectSchemaListHeader
                v-bind="aspect"
                @edit-item="showEditDialog(aspect.item, 'aspect')"
                @delete-item="showDeleteDialog(aspect.item.title, 'aspect')"
              />
              <EditorObjectSchemaListItem
                v-for="(attribute, index2) of aspect.item.attributes"
                v-show="attributeContainsTitle(attribute, search)"
                :key="index2"
                v-bind="attribute"
                :styling="newItemTypes[attribute.type]"
                two-line
                translate
              />
            </v-list>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="overline">
          {{ globalT('editor.customlinks') }} ({{ customLinks.length }})
          <div class="d-flex">
            <v-spacer />
            <v-btn
              small
              variant="text"
              color="primary"
              @click.stop="showAddDialog('link')"
            >
              <v-icon
                size="small"
                :icon="mdiPlus"
              />
              <span>{{ t('addCustomLink') }}</span>
            </v-btn>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card
            v-for="(link, index) of customLinks"
            v-show="itemContainsAttributeTitle(link, search)"
            :key="index"
            class="mb-2 overflow-hidden"
            outlined
          >
            <v-list class="py-0">
              <EditorObjectSchemaListHeader
                v-bind="link"
                :styling="{
                  name: formattedLinkHeader(link.item),
                  color: 'black'
                }"
                @edit-item="showEditDialog(link.item, 'link')"
                @delete-item="showDeleteDialog(link.item.title, 'link')"
              />
              <EditorObjectSchemaListItem
                v-for="(attribute, index2) of link.item.attributes"
                v-show="attributeContainsTitle(attribute, search)"
                :key="index2"
                v-bind="attribute"
                :styling="newItemTypes[attribute.type]"
                two-line
                translate
              />
            </v-list>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <EditorObjectSchemaCustomPropertiesDialog
      v-model="objectSchemaDialog.value"
      v-bind="objectSchemaDialog"
      :domain-id="domainId"
      @success="onEditPropertySuccess"
      @error="onEditPropertyError"
      @delete="showDeleteDialog(objectSchemaDialog.propertyId, objectSchemaDialog.type)"
    />
    <EditorObjectSchemaDeleteCustomPropertyDialog
      v-model="deleteDialog.value"
      v-bind="deleteDialog"
      @delete-item="doDeleteItem()"
    />
  </div>
</template>

<script lang="ts">
import { Ref } from 'vue';
import { mdiPlus } from '@mdi/js';

import ObjectSchemaHelper, { IVeoOSHCustomAspect, IVeoOSHCustomLink, IVeoOSHCustomProperty } from '~/lib/ObjectSchemaHelper2';
import { IInputType, INPUT_TYPES } from '~/types/VeoEditor';

interface EditorPropertyItem {
  item: IVeoOSHCustomAspect | IVeoOSHCustomLink | IVeoOSHCustomProperty;
  styling?: IInputType;
}

export default defineComponent({
  props: {
    search: {
      type: String,
      default: ''
    },
    hideEmptyAspects: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['schema-updated'],
  setup(_props, context) {
    const { t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const { displayErrorMessage } = useVeoAlerts();

    function itemContainsAttributeTitle(item: EditorPropertyItem, title: string): boolean {
      return (
        !title ||
        title.length === 0 ||
        item.item.title.toLowerCase().includes(title.toLowerCase()) ||
        (item.item as IVeoOSHCustomAspect | IVeoOSHCustomLink).attributes.some((attribute: IVeoOSHCustomProperty) => attributeContainsTitle(attribute, title))
      );
    }

    function attributeContainsTitle(property: IVeoOSHCustomProperty, title: string) {
      return !title || title.length === 0 || (property.title && property.title.toLowerCase().includes(title.toLowerCase()));
    }

    /**
     * schema related stuff
     */
    const objectSchemaHelper = inject<Ref<ObjectSchemaHelper>>('objectSchemaHelper');

    const customAspects = ref<EditorPropertyItem[]>([]);
    const customLinks = ref<EditorPropertyItem[]>([]);
    const basicProps = ref<EditorPropertyItem[]>([]);

    const expansionPanels = ref([0, 1, 2]);

    computeProperties();
    watch(
      () => objectSchemaHelper.value,
      (val: ObjectSchemaHelper) => {
        objectSchemaHelper.value = val;
        computeProperties();
      }
    );

    // Sadly computed refs wouldn't catch schema updates, so we have to deal with it on our own.
    function computeProperties() {
      customAspects.value = objectSchemaHelper.value.getCustomAspects().map((entry: IVeoOSHCustomAspect) => {
        return {
          item: entry,
          styling: undefined
        };
      });
      customLinks.value = objectSchemaHelper.value.getCustomLinks().map((entry: IVeoOSHCustomLink) => {
        // @ts-ignore Custom links don't have a type property, however we need it for the editor. It gets removed when converting back to a schema
        entry.type = entry.targetType;
        return {
          item: entry,
          styling: undefined
        };
      });
      basicProps.value = objectSchemaHelper.value.getBasicProperties().map((entry: IVeoOSHCustomProperty) => {
        return {
          item: entry,
          styling: INPUT_TYPES[entry.type]
        };
      });
    }

    function formattedLinkHeader(link: IVeoOSHCustomLink): string {
      let toReturn = link.targetType;

      if (link.subType) {
        toReturn += ` (${link.subType})`;
      }

      return toReturn;
    }

    /**
     * Editing customAspects and customLinks
     */
    const objectSchemaDialog = ref({
      value: false,
      type: 'aspect' as 'aspect' | 'link',
      propertyId: undefined as undefined | string
    });

    function showAddDialog(type: 'aspect' | 'link') {
      objectSchemaDialog.value.value = true;
      objectSchemaDialog.value.type = type;
      objectSchemaDialog.value.propertyId = undefined;
    }

    // Removing types from the new item type selection as they are purely used as a fallback.
    const newItemTypes = ref(JSON.parse(JSON.stringify(INPUT_TYPES)));
    delete newItemTypes.value.default;
    delete newItemTypes.value.null;

    function showEditDialog(property: IVeoOSHCustomAspect | IVeoOSHCustomLink, type: 'aspect' | 'link') {
      objectSchemaDialog.value.value = true;
      objectSchemaDialog.value.type = type;
      objectSchemaDialog.value.propertyId = property.title;
    }

    function onEditPropertyError(e: any) {
      displayErrorMessage(t('createCustomPropertyError'), e);
    }

    function onEditPropertySuccess() {
      objectSchemaDialog.value.value = false;
      // Set it to undefined so that in the component changes in the aspect will get picked up if the same property gets edited right after this
      objectSchemaDialog.value.propertyId = undefined;
      context.emit('schema-updated');
      computeProperties();
    }

    /**
     * Deleting items
     */
    const deleteDialog = ref({
      value: false,
      title: '',
      type: 'aspect' as 'link' | 'aspect'
    });
    function showDeleteDialog(propertyId: string, type: 'aspect' | 'link') {
      deleteDialog.value.type = type;
      deleteDialog.value.title =
        (type === 'aspect' ? objectSchemaHelper.value.getCustomAspect(propertyId)?.title : objectSchemaHelper.value.getCustomLink(propertyId)?.title) || '';
      deleteDialog.value.value = true;
    }

    function doDeleteItem() {
      objectSchemaDialog.value.value = false;
      if (deleteDialog.value.type === 'aspect') {
        objectSchemaHelper.value.removeCustomAspect(deleteDialog.value.title);
      } else {
        objectSchemaHelper.value.removeCustomLink(deleteDialog.value.title);
      }
      deleteDialog.value.value = false;
      context.emit('schema-updated');
      computeProperties();
    }

    return {
      itemContainsAttributeTitle,
      attributeContainsTitle,
      objectSchemaDialog,
      expansionPanels,
      showAddDialog,
      onEditPropertyError,
      onEditPropertySuccess,
      showEditDialog,
      newItemTypes,
      basicProps,
      customAspects,
      customLinks,
      deleteDialog,
      showDeleteDialog,
      doDeleteItem,
      formattedLinkHeader,

      mdiPlus,
      t,
      globalT
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createCustomPropertyError": "Couldn't create link/aspect",
    "addCustomLink": "Add link"
  },
  "de": {
    "createCustomPropertyError": "Der Link/Aspekt konnte nicht erstellt werden",
    "addCustomLink": "Link hinzufügen"
  }
}
</i18n>

<style lang="scss" scoped>
.v-expansion-panel-title {
  min-height: auto !important;
  padding-left: 0;
  padding-right: 0;
}

.v-expansion-panel-text > :-deep(.v-expansion-panel-text__wrap) {
  padding-left: 0;
  padding-right: 0;
}

.json-highlighter {
  margin: 0 !important;
  padding: 0 !important;

  :deep(.language-json) {
    margin: 0 !important;
  }
}
</style>
