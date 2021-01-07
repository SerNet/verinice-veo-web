<template>
  <div style="display: contents; width: 100%">
    <v-expansion-panels accordion multiple :value="[0, 1, 2]" flat>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline">
          {{ $t('editor.basicproperties') }} ({{ basicProps.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card outlined>
            <v-list class="py-0" dense disabled>
              <ObjectSchemaEditorListItem
                v-for="(child, index) of basicProps"
                v-show="attributeContainsTitle(child.item, search)"
                :key="index"
                :title="child.item.title"
                :description="child.item.description"
                :styling="child.styling"
                two-line
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
              <ObjectSchemaEditorListHeader
                v-bind="aspect"
                @edit-item="showEditDialog(aspect.item, 'aspect')"
                @delete-item="showDeleteDialog(aspect.item, 'aspect')"
              />
              <ObjectSchemaEditorListItem
                v-for="(attribute, index2) of aspect.item.attributes"
                v-show="attributeContainsTitle(attribute, search)"
                :key="index2"
                :title="attribute.title"
                :description="attribute.description"
                :styling="newItemTypes[attribute.type]"
                two-line
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
              <span>{{ $t('editor.customlinks.add') }}</span>
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
              <ObjectSchemaEditorListHeader
                v-bind="link"
                :styling="{
                  name: link.item.raw.items.properties.target.properties.type.enum[0],
                  color: 'black'
                }"
                @edit-item="showEditDialog(link.item, 'link')"
                @delete-item="showDeleteDialog(link.item, 'link')"
              />
              <ObjectSchemaEditorListItem
                v-for="(attribute, index2) of link.item.attributes"
                v-show="attributeContainsTitle(attribute, search)"
                :key="index2"
                :title="attribute.title"
                :description="attribute.description"
                :styling="newItemTypes[attribute.type]"
                two-line
              />
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <VEOOSECustomPropertiesDialog
      v-model="objectSchemaDialog.value"
      v-bind="objectSchemaDialog"
      :schema="schema"
      :type-map="newItemTypes"
      @create-node="doAddItem"
      @save-node="doEditItem"
      @delete-item="showDeleteDialog(objectSchemaDialog.item, objectSchemaDialog.type)"
    />
    <VEOOSEDeleteCustomPropertyDialog
      v-model="deleteDialog.value"
      v-bind="deleteDialog"
      @delete-item="doDeleteItem()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch } from '@nuxtjs/composition-api'

import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import {
  addAspectToSchema,
  generateAspect,
  getAspects,
  getBasicProperties,
  getLinks,
  updateAspectAttributes,
  IVEOCustomLink,
  IVEOCustomAspect,
  IVEOBasicProperty,
  getAspect,
  generateLink,
  addLinkToSchema,
  getLink,
  updateLinkAttributes,
  IVEOAttribute,
  renameAspect,
  renameLink,
  updateLinkDetails,
  deleteAspect,
  deleteLink,
  prefixedAspectName
} from '~/lib/ObjectSchemaHelper'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { IInputType, INPUT_TYPES } from '~/types/VEOEditor'

import VEOOSECustomPropertiesDialog from '~/components/dialogs/SchemaEditors/VEOOSECustomPropertiesDialog.vue'
import VEOOSEDeleteCustomPropertyDialog from '~/components/dialogs/SchemaEditors/VEOOSEDeleteCustomPropertyDialog.vue'

interface IProps {
  value: VEOObjectSchemaRAW
  search: string
  hideEmptyAspects: boolean
}

interface EditorPropertyItem {
  item: IVEOCustomLink | IVEOCustomAspect | IVEOBasicProperty
  styling?: IInputType
}

export default defineComponent<IProps>({
  components: {
    VEOOSECustomPropertiesDialog,
    VEOOSEDeleteCustomPropertyDialog
  },
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
        (item.item as IVEOCustomAspect | IVEOCustomLink).attributes.some((attribute: IVEOAttribute) =>
          attributeContainsTitle(attribute, title)
        )
      )
    }

    function attributeContainsTitle(property: IVEOAttribute | IVEOBasicProperty, title: string) {
      return (
        !title || title.length === 0 || (property.title && property.title.toLowerCase().includes(title.toLowerCase()))
      )
    }

    /**
     * schema related stuff
     */
    // @ts-ignore
    const schema: Ref<VEOObjectSchemaRAW> = ref(props.value)

    const customAspects: Ref<EditorPropertyItem[]> = ref([])
    const customLinks: Ref<EditorPropertyItem[]> = ref([])
    const basicProps: Ref<EditorPropertyItem[]> = ref([])

    computeProperties()
    watch(
      () => props.value,
      (val: VEOObjectSchemaRAW) => {
        schema.value = val
        computeProperties()
      }
    )

    // Sadly computed refs wouldn't catch schema updates, so we have to deal with it on our own.
    function computeProperties() {
      const _schema = JSON.parse(JSON.stringify(schema.value))

      customAspects.value = getAspects(_schema).map((entry: IVEOCustomAspect) => {
        return {
          item: entry,
          styling: undefined
        }
      })
      customLinks.value = getLinks(_schema).map((entry: IVEOCustomLink) => {
        return {
          item: entry,
          styling: undefined
        }
      })
      basicProps.value = getBasicProperties(_schema).map((entry: IVEOBasicProperty) => {
        return {
          item: entry,
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
    const newItemTypes: Ref<any> = ref(INPUT_TYPES)
    delete newItemTypes.value.default
    delete newItemTypes.value.null

    function doAddItem(form: { name: string; targetType?: string; targetDescription?: string }) {
      try {
        if (objectSchemaDialog.value.type === 'aspect') {
          const newAspect = generateAspect()
          addAspectToSchema(schema.value, form.name, newAspect)

          // We have to transform the aspect name in order to access it via the key in the schema
          const aspectId = prefixedAspectName(schema.value, form.name)
          objectSchemaDialog.value.item = getAspect(schema.value, aspectId)
        } else {
          const newLink = generateLink(form.targetType || '', form.targetDescription || '')
          addLinkToSchema(schema.value, form.name, newLink)

          // We have to transform the aspect name in order to access it via the key in the schema
          const aspectId = prefixedAspectName(schema.value, form.name)
          objectSchemaDialog.value.item = getLink(schema.value, aspectId)
        }
        showEditDialog(objectSchemaDialog.value.item, objectSchemaDialog.value.type)
        context.emit('schema-updated', schema.value)
        computeProperties()
      } catch (e) {
        context.root.$emit(VeoEvents.ALERT_ERROR, {
          title: context.root.$i18n.t('editor.dialog.createform.error'),
          text: e
        })
      }
    }

    function showEditDialog(aspect: IVEOCustomAspect | IVEOCustomLink, type: 'aspect' | 'link') {
      objectSchemaDialog.value.mode = 'edit'
      objectSchemaDialog.value.item = aspect
      objectSchemaDialog.value.value = true
      objectSchemaDialog.value.type = type
    }

    function doEditItem(object: { item: IVEOCustomAspect | IVEOCustomLink; id: string }) {
      if (object.item.title !== object.id) {
        const newTitle = object.item.title
        object.item.title = object.id

        if (objectSchemaDialog.value.type === 'aspect') {
          renameAspect(schema.value, object.item as IVEOCustomAspect, newTitle)
        } else {
          renameLink(schema.value, object.item as IVEOCustomLink, newTitle)
        }
        object.item.title = newTitle
      }

      if (objectSchemaDialog.value.type === 'aspect') {
        updateAspectAttributes(schema.value, object.item as IVEOCustomAspect, object.item.attributes)
      } else {
        updateLinkAttributes(schema.value, object.item as IVEOCustomLink, object.item.attributes)
        updateLinkDetails(schema.value, object.item as IVEOCustomLink, {
          type: (object.item as IVEOCustomLink).target.type,
          description: (object.item as IVEOCustomLink).target.description
        })
      }

      objectSchemaDialog.value.value = false
      context.emit('schema-updated', schema.value)
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
    function showDeleteDialog(item: IVEOCustomAspect | IVEOCustomLink, type: 'aspect' | 'link') {
      deleteDialog.value.type = type
      deleteDialog.value.title = item.title
      deleteDialog.value.value = true
    }

    function doDeleteItem() {
      objectSchemaDialog.value.value = false
      if (deleteDialog.value.type === 'aspect') {
        deleteAspect(schema.value, deleteDialog.value.title)
      } else {
        deleteLink(schema.value, deleteDialog.value.title)
      }
      deleteDialog.value.value = false
      context.emit('schema-updated', schema.value)
      computeProperties()
    }

    return {
      schema,
      itemContainsAttributeTitle,
      attributeContainsTitle,
      objectSchemaDialog,
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
