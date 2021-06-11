<template>
  <div
    class="fill-width"
    style="display: contents;"
  >
    <v-expansion-panels
      accordion
      multiple
      :value="expansionPanels"
      flat
    >
      <v-expansion-panel>
        <v-expansion-panel-header
          class="overline"
        >
          {{ $t('editor.basicproperties') }} ({{ basicProps.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card outlined>
            <v-list
              class="py-0"
              dense
              disabled
            >
              <VeoOseListItem
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
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline">
          {{ $t('editor.customaspects') }} ({{ customAspects.length }})
          <div class="d-flex">
            <v-spacer />
            <v-btn
              small
              text
              color="primary"
              @click.stop="showAddDialog('aspect')"
            >
              <v-icon small>
                mdi-plus
              </v-icon>
              <span>{{ $t('editor.customaspects.add') }}</span>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card
            v-for="(aspect, index) of customAspects"
            v-show="
              (!hideEmptyAspects || aspect.item.attributes.length > 0) && itemContainsAttributeTitle(aspect, search)
            "
            :key="index"
            class="mb-2"
            outlined
          >
            <v-list
              class="py-0"
              dense
            >
              <VeoOseListHeader
                v-bind="aspect"
                @edit-item="showEditDialog(aspect.item, 'aspect')"
                @delete-item="showDeleteDialog(aspect.item.title, 'aspect')"
              />
              <VeoOseListItem
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
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline">
          {{ $t('editor.customlinks') }} ({{ customLinks.length }})
          <div class="d-flex">
            <v-spacer />
            <v-btn
              small
              text
              color="primary"
              @click.stop="showAddDialog('link')"
            >
              <v-icon small>
                mdi-plus
              </v-icon>
              <span>{{ $t('addCustomLink') }}</span>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card
            v-for="(link, index) of customLinks"
            v-show="itemContainsAttributeTitle(link, search)"
            :key="index"
            class="mb-2"
            outlined
          >
            <v-list
              class="py-0"
              dense
            >
              <VeoOseListHeader
                v-bind="link"
                :styling="{
                  name: formattedLinkHeader(link.item),
                  color: 'black'
                }"
                @edit-item="showEditDialog(link.item, 'link')"
                @delete-item="showDeleteDialog(link.item.title, 'link')"
              />
              <VeoOseListItem
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
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <VeoOseCustomPropertiesDialog
      v-model="objectSchemaDialog.value"
      v-bind="objectSchemaDialog"
      @success="onEditPropertySuccess"
      @error="onEditPropertyError"
      @delete="showDeleteDialog(objectSchemaDialog.propertyId, objectSchemaDialog.type)"
    />
    <VeoOseDeleteCustomPropertyDialog
      v-model="deleteDialog.value"
      v-bind="deleteDialog"
      @delete-item="doDeleteItem()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, Ref, watch } from '@nuxtjs/composition-api';

import ObjectSchemaHelper, { IVeoOSHCustomAspect, IVeoOSHCustomLink, IVeoOSHCustomProperty } from '~/lib/ObjectSchemaHelper2';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { IInputType, INPUT_TYPES } from '~/types/VeoEditor';

interface IProps {
  search: string;
  hideEmptyAspects: boolean;
}

interface EditorPropertyItem {
  item: IVeoOSHCustomAspect | IVeoOSHCustomLink | IVeoOSHCustomProperty;
  styling?: IInputType;
}

export default defineComponent<IProps>({
  props: {
    search: {
      type: String,
      default: ''
    },
    hideEmptyAspects: {
      type: Boolean,
      default: false
    }
  },
  setup(_props, context) {
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
    // @ts-ignore
    const objectSchemaHelper: Ref<ObjectSchemaHelper> = inject('objectSchemaHelper');

    const customAspects: Ref<EditorPropertyItem[]> = ref([]);
    const customLinks: Ref<EditorPropertyItem[]> = ref([]);
    const basicProps: Ref<EditorPropertyItem[]> = ref([]);

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
        // @ts-ignore
        entry.type = entry.targetType;
        return {
          item: entry,
          styling: undefined
        };
      });
      basicProps.value = objectSchemaHelper.value.getBasicProperties().map((entry: IVeoOSHCustomProperty) => {
        return {
          item: entry,
          // @ts-ignore
          styling: INPUT_TYPES[entry.type]
        };
      });
    }

    function formattedLinkHeader(link: IVeoOSHCustomLink): string {
      let toReturn = link.targetType;

      if (link.subType && link.subType !== '') {
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
    const newItemTypes: Ref<any> = ref(JSON.parse(JSON.stringify(INPUT_TYPES)));
    delete newItemTypes.value.default;
    delete newItemTypes.value.null;

    function showEditDialog(property: IVeoOSHCustomAspect | IVeoOSHCustomLink, type: 'aspect' | 'link') {
      objectSchemaDialog.value.value = true;
      objectSchemaDialog.value.type = type;
      objectSchemaDialog.value.propertyId = property.title;
    }

    function onEditPropertyError(e: any) {
      context.root.$emit(VeoEvents.ALERT_ERROR, {
        title: context.root.$i18n.t('createCustomPropertyError'),
        text: e
      });
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
      formattedLinkHeader
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
@import '~/assets/vuetify.scss';

.v-expansion-panel-header {
  min-height: auto !important;
  padding: 8px 24px !important;
}

.json-highlighter {
  margin: 0 !important;
  padding: 0 !important;

  ::v-deep .language-json {
    margin: 0 !important;
  }
}
</style>

function deepClone(arg0: IVeoOSHCustomLink|undefined): any {
  throw new Error('Function not implemented.')
}
