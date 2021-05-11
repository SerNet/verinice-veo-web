<template>
  <div class="fill-width" style="display: contents;">
    <v-expansion-panels accordion multiple :value="expansionPanels" flat>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline"
          >{{ $t('editor.basicproperties') }} ({{ basicProps.length }})</v-expansion-panel-header
        >
        <v-expansion-panel-content>
          <v-card outlined>
            <v-list class="py-0" dense disabled>
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
            <v-btn small text color="primary" @click.stop="showAddDialog('aspect')">
              <v-icon small>mdi-plus</v-icon>
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
            <v-list class="py-0" dense>
              <VeoOseListHeader
                v-bind="aspect"
                @edit-item="showEditDialog(aspect.item, 'aspect')"
                @delete-item="showDeleteDialog(aspect.item, 'aspect')"
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
            <v-btn small text color="primary" @click.stop="showAddDialog('link')">
              <v-icon small>mdi-plus</v-icon>
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
            <v-list class="py-0" dense>
              <VeoOseListHeader
                v-bind="link"
                :styling="{
                  name: link.item.targetType,
                  color: 'black'
                }"
                @edit-item="showEditDialog(link.item, 'link')"
                @delete-item="showDeleteDialog(link.item, 'link')"
              />
              <VeoOseListItem
                v-for="(attribute, index2) of link.item.attributes"
                v-show="attributeContainsTitle(attribute, search)"
                :key="index2"
                :title="attribute.title"
                :description="attribute.description"
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
      @create-node="doAddItem"
      @save-node="doEditItem"
      @delete-item="showDeleteDialog(objectSchemaDialog.item, objectSchemaDialog.type)"
    />
    <VeoOseDeleteCustomPropertyDialog
      v-model="deleteDialog.value"
      v-bind="deleteDialog"
      @delete-item="doDeleteItem()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, Ref, watch } from '@nuxtjs/composition-api'

import ObjectSchemaHelper, {
  IVeoOSHCustomAspect,
  IVeoOSHCustomLink,
  IVeoOSHCustomProperty
} from '~/lib/ObjectSchemaHelper2'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import {
  IInputType,
  INPUT_TYPES
} from '~/types/VeoEditor'
import { cloneDeep } from 'lodash'

interface IProps {
  value: ObjectSchemaHelper
  search: string
  hideEmptyAspects: boolean
}

interface EditorPropertyItem {
  item: IVeoOSHCustomAspect | IVeoOSHCustomLink | IVeoOSHCustomProperty
  styling?: IInputType
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Object,
      required: true
    },
    search: {
      type: String,
      default: ''
    },
    hideEmptyAspects: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    function itemContainsAttributeTitle(item: EditorPropertyItem, title: string): boolean {
      return (
        !title ||
        title.length === 0 ||
        item.item.title.toLowerCase().includes(title.toLowerCase()) ||
        (item.item as IVeoOSHCustomAspect | IVeoOSHCustomLink).attributes.some((attribute: IVeoOSHCustomProperty) =>
          attributeContainsTitle(attribute, title)
        )
      )
    }

    function attributeContainsTitle(property: IVeoOSHCustomProperty, title: string) {
      return (
        !title || title.length === 0 || (property.title && property.title.toLowerCase().includes(title.toLowerCase()))
      )
    }

    /**
     * schema related stuff
     */
    // @ts-ignore
    const objectSchemaHelper: Ref<ObjectSchemaHelper> = ref(props.value)
    const displayLanguage: Ref<string> | undefined = inject('displayLanguage');

    const customAspects: Ref<EditorPropertyItem[]> = ref([])
    const customLinks: Ref<EditorPropertyItem[]> = ref([])
    const basicProps: Ref<EditorPropertyItem[]> = ref([])

    const expansionPanels = ref([0, 1, 2])

    computeProperties()
    watch(
      () => props.value,
      (val: ObjectSchemaHelper) => {
        objectSchemaHelper.value = val
        computeProperties()
      }
    )

    // Sadly computed refs wouldn't catch schema updates, so we have to deal with it on our own.
    function computeProperties() {
      customAspects.value = objectSchemaHelper.value.getCustomAspects().map((entry: IVeoOSHCustomAspect) => {
        return {
          item: entry,
          styling: undefined
        }
      })
      customLinks.value = objectSchemaHelper.value.getCustomLinks().map((entry: IVeoOSHCustomLink) => {
        // @ts-ignore
        entry.type = entry.targetType
        return {
          item: entry,
          styling: undefined
        }
      })
      basicProps.value = objectSchemaHelper.value.getBasicProperties().map((entry: IVeoOSHCustomProperty) => {
        return {
          item: entry,
          // @ts-ignore
          styling: INPUT_TYPES[entry.type]
        }
      })
    }

    /**
     * Editing customAspects and customLinks
     */
    const objectSchemaDialog = ref({
      value: false,
      item: {} as any,
      mode: 'create' as 'create' | 'edit',
      type: 'aspect' as 'aspect' | 'link'
    })

    function showAddDialog(type: 'aspect' | 'link') {
      objectSchemaDialog.value.mode = 'create'
      objectSchemaDialog.value.value = true
      objectSchemaDialog.value.item = undefined
      objectSchemaDialog.value.type = type
    }

    // Removing types from the new item type selection as they are purely used as a fallback.
    const newItemTypes: Ref<any> = ref(JSON.parse(JSON.stringify(INPUT_TYPES)))
    delete newItemTypes.value.default
    delete newItemTypes.value.null

    function doAddItem(form: { name: string; targetType?: string; description?: string }) {
      try {
        if (objectSchemaDialog.value.type === 'aspect') {
          objectSchemaHelper.value.addCustomAspect(form.name)
          objectSchemaDialog.value.item = objectSchemaHelper.value.getCustomAspect(form.name)
        } else {
          objectSchemaHelper.value.addCustomLink(form.name, form.targetType || '', form.description || '')
          objectSchemaDialog.value.item = objectSchemaHelper.value.getCustomLink(form.name)
        }
        showEditDialog(objectSchemaDialog.value.item, objectSchemaDialog.value.type)
        context.emit('schema-updated')
        computeProperties()
      } catch (e) {
        context.root.$emit(VeoEvents.ALERT_ERROR, {
          title: context.root.$i18n.t('createCustomPropertyError'),
          text: e
        })
      }
    }

    function showEditDialog(aspect: IVeoOSHCustomAspect | IVeoOSHCustomLink, type: 'aspect' | 'link') {
      objectSchemaDialog.value.mode = 'edit'
      objectSchemaDialog.value.item = aspect
      objectSchemaDialog.value.value = true
      objectSchemaDialog.value.type = type
    }

    function doEditItem(object: { item: IVeoOSHCustomAspect | IVeoOSHCustomLink; id: string }) {
      let original;

      if(objectSchemaDialog.value.type === 'aspect') {
        original = cloneDeep(objectSchemaHelper.value.getCustomAspect(object.id))
      } else {
        original = cloneDeep(objectSchemaHelper.value.getCustomLink(object.id))
      }

      if (object.item.title !== object.id) {
        if (objectSchemaDialog.value.type === 'aspect') {
          objectSchemaHelper.value.renameCustomAspect(object.id, object.item.title)
        } else {
          objectSchemaHelper.value.renameCustomLink(object.id, object.item.title)
        }
        objectSchemaHelper.value.removeTranslationsContainingKey(object.id)
      }

      if (objectSchemaDialog.value.type === 'aspect') {
        objectSchemaHelper.value.updateCustomAspectAttributes(object.item.title, object.item.attributes)
      } else {
        objectSchemaHelper.value.updateCustomLink(object.item.title, object.item as IVeoOSHCustomLink)
      }

      // Add a translation key for each attribute
      if(displayLanguage) {
        for(let attribute of object.item.attributes) {
          objectSchemaHelper.value.updateTranslation(
            displayLanguage.value,
            `${attribute.prefix}${attribute.title}`,
            `${attribute.description}`,
          );

          if(attribute.type === 'enum' && attribute.enum) {
            for(const option of attribute.enum) {
              objectSchemaHelper.value.addTranslation(
                `${attribute.prefix}${attribute.title}_${option}`,
                option,
                displayLanguage.value
              )
            }
          }
        }

        // Remove translations of renamed attributes
        if(original) {
          for(let oldAttribute of original.attributes) {
            if(!object.item.attributes.find(item => item.title === oldAttribute.title)) {
              objectSchemaHelper.value.removeTranslation(`${oldAttribute.prefix}${oldAttribute.title}`)
            }
          }
        }
      }

      objectSchemaDialog.value.value = false
      objectSchemaDialog.value.item = undefined // Set to undefined so the new item gets picked up
      context.emit('schema-updated')
      computeProperties()
    }

    /**
     * Deleting items
     */
    const deleteDialog = ref({
      value: false,
      title: '',
      type: 'aspect' as 'link' | 'aspect'
    })
    function showDeleteDialog(item: IVeoOSHCustomAspect | IVeoOSHCustomLink, type: 'aspect' | 'link') {
      deleteDialog.value.type = type
      deleteDialog.value.title = item.title
      deleteDialog.value.value = true
    }

    function doDeleteItem() {
      objectSchemaDialog.value.value = false
      if (deleteDialog.value.type === 'aspect') {
        objectSchemaHelper.value.removeCustomAspect(deleteDialog.value.title)
      } else {
        objectSchemaHelper.value.removeCustomLink(deleteDialog.value.title)
      }
      deleteDialog.value.value = false
      context.emit('schema-updated')
      computeProperties()
    }

    return {
      itemContainsAttributeTitle,
      attributeContainsTitle,
      objectSchemaDialog,
      expansionPanels,
      showAddDialog,
      doAddItem,
      showEditDialog,
      doEditItem,
      newItemTypes,
      basicProps,
      customAspects,
      customLinks,
      deleteDialog,
      showDeleteDialog,
      doDeleteItem
    }
  }
})
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
