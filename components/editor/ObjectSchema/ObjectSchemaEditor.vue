<template>
  <div>
    <div class="mx-5 my-4">
      <v-text-field v-model="search" dense clearable flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Nach einer Eigenschaft suchen..." />
      <v-checkbox v-model="hideEmptyAspects" class="caption" dense hide-details label="Leere Aspekte ausblenden" />
    </div>
    <v-expansion-panels accordion multiple :value="[0, 1, 2]" flat>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline">
          Basic properties ({{ basicProps.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card outlined>
            <v-list class="py-0" dense>
              <ObjectSchemaListItem v-for="(child, index) of basicProps" :key="index" v-bind="child" two-line />
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline">
          Custom Aspects ({{ customAspects.length }})
          <div class="d-flex">
            <v-spacer />
            <v-btn small text color="primary" @click.stop="showAddDialog('aspect')">
              <v-icon small>mdi-plus</v-icon>
              <span>Add custom aspect</span>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card v-for="(aspect, index) of customAspects" v-show="(!hideEmptyAspects || aspect.item.attributes.length > 0) && itemContainsAttributeTitle(aspect, search)" :key="index" class="mb-2" outlined>
            <v-list class="py-0" dense>
              <ObjectSchemaListHeader v-bind="aspect" @click="showEditDialog(aspect.item, 'aspect')" />
              <ObjectSchemaListItem v-for="(attribute, index2) of aspect.item.attributes" v-show="attributeContainsTitle(attribute, search)" :key="index2" :item="attribute" :styling="typeMap[attribute.type]" two-line @click="showEditDialog(aspect.item, 'aspect')" />
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline">
          Custom Links ({{ customLinks.length }})
          <div class="d-flex">
            <v-spacer />
            <v-btn small text color="primary" @click.stop="showAddDialog('link')">
              <v-icon small>mdi-plus</v-icon>
              <span>Add custom link</span>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card v-for="(link, index) of customLinks" v-show="itemContainsAttributeTitle(link, search)" :key="index" class="mb-2" outlined>
            <v-list class="py-0" dense>
              <ObjectSchemaListHeader v-bind="link" :styling="{ name: link.item.raw.items.properties.target.properties.type.enum[0], color: 'black' }" @click="showEditDialog(link.item, 'link')" />
              <ObjectSchemaListItem v-for="(attribute, index2) of link.item.attributes" v-show="attributeContainsTitle(attribute, search)" :key="index2" :item="attribute" :styling="typeMap[attribute.type]" two-line @click="showEditDialog(link.item, 'link')" />
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <ObjectSchemaDialog v-model="objectSchemaDialog.value" v-bind="objectSchemaDialog" :type-map="typeMap" @create-node="doAddItem" @save-node="doEditItem" />
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, ref, Ref, watch } from '@nuxtjs/composition-api'

import { VEOObjectSchemaRAW, VEOTypeNameRAW } from 'veo-objectschema-7'
import { addAspectToSchema, generateAspect, getAspects, getBasicProperties, getLinks, updateAspectAttributes, IVEOCustomLink, IVEOCustomAspect, IVEOBasicProperty, getAspect, generateLink, addLinkToSchema, getLink, updateLinkAttributes, IVEOAttribute } from '~/lib/ObjectSchemaHelper'

export interface ITypeInfo {
  name: string
  color: string
  icon: string
}

interface IProps {
  value: VEOObjectSchemaRAW
}

interface EditorPropertyItem {
  item: IVEOCustomLink | IVEOCustomAspect | IVEOBasicProperty
  styling?: ITypeInfo
}

export default defineComponent<IProps>({
  props: {
    value: { type: Object, required: true }
  },
  setup(props, context) {
    /**
     * UI stuff
     */
    const search = ref('')
    const hideEmptyAspects = ref(true)

    const typeMap: Ref<Record<VEOTypeNameRAW, ITypeInfo>> = ref({
      string: { icon: 'mdi-alphabetical-variant', name: 'string', color: 'red' },
      boolean: { icon: 'mdi-check-box-outline', name: 'boolean', color: 'teal' },
      object: { icon: 'mdi-file-tree', name: 'object', color: 'indigo' },
      number: { icon: 'mdi-decimal', name: 'number', color: 'light-blue' },
      integer: { icon: 'mdi-numeric', name: 'integer', color: 'green' },
      array: { icon: 'mdi-view-list', name: 'array', color: 'amber' },
      enum: { icon: 'mdi-label-multiple', name: 'enum', color: 'light-green' },
      null: { icon: 'mdi-cancel', name: 'null', color: 'blue-grey' },
      default: { icon: 'mdi-help-box', name: 'unknown', color: 'grey' }
    })

    function itemContainsAttributeTitle(item: EditorPropertyItem, title: string): boolean {
      return !title || title.length === 0 || item.item.title.toLowerCase().includes(title.toLowerCase()) || (item.item as IVEOCustomAspect | IVEOCustomLink).attributes.some((attribute: IVEOAttribute) => attributeContainsTitle(attribute, title))
    }

    function attributeContainsTitle(property: IVEOAttribute, title: string) {
      return !title || title.length === 0 || (property.title && property.title.toLowerCase().includes(title.toLowerCase()))
    }

    /**
     * schema related stuff
     */
    // @ts-ignore
    const schema: Ref<VEOObjectSchemaRAW> = ref(props.value)

    watch(() => props.value, (val: VEOObjectSchemaRAW) => {
      schema.value = val
    }, { deep: true })

    const customAspects: ComputedRef<EditorPropertyItem[]> = computed(() => {
      return getAspects(schema.value).map((entry: IVEOCustomAspect) => {
        return {
          item: entry,
          styling: undefined
        }
      })
    })
    const customLinks: ComputedRef<EditorPropertyItem[]> = computed(() => {
      return getLinks(schema.value).map((entry: IVEOCustomLink) => {
        return {
          item: entry,
          styling: undefined
        }
      })
    })
    const basicProps: ComputedRef<EditorPropertyItem[]> = computed(() => {
      return getBasicProperties(schema.value).map((entry: IVEOBasicProperty) => {
        return {
          item: entry,
          styling: typeMap.value[entry.type]
        }
      })
    })

    /**
     * Editing customAspects and customLinks
     */
    const objectSchemaDialog = ref({ value: false, item: {} as any, mode: 'create' as ('create' | 'edit'), type: 'aspect' as ('aspect' | 'link') })

    function showAddDialog(type: 'aspect' | 'link') {
      objectSchemaDialog.value.mode = 'create'
      objectSchemaDialog.value.value = true
      objectSchemaDialog.value.item = undefined
      objectSchemaDialog.value.type = type
    }

    function doAddItem(form: { name: string, targetType?: string, targetDescription?: string }) {
      if (objectSchemaDialog.value.type === 'aspect') {
        const newAspect = generateAspect(form.name)
        addAspectToSchema(schema.value, newAspect)
        objectSchemaDialog.value.item = getAspect(schema.value, newAspect.properties.type.enum[0])
      } else {
        const newLink = generateLink(form.name, form.targetType || '', form.targetDescription || '')
        addLinkToSchema(schema.value, newLink)
        objectSchemaDialog.value.item = getLink(schema.value, newLink.items.properties.type.enum[0])
      }
      showEditDialog(objectSchemaDialog.value.item, objectSchemaDialog.value.type)
    }

    function showEditDialog(aspect: IVEOCustomAspect | IVEOCustomLink, type: 'aspect' | 'link') {
      objectSchemaDialog.value.mode = 'edit'
      objectSchemaDialog.value.item = aspect
      objectSchemaDialog.value.value = true
      objectSchemaDialog.value.type = type
    }

    function doEditItem(item: IVEOCustomAspect | IVEOCustomLink) {
      if (objectSchemaDialog.value.type === 'aspect') {
        updateAspectAttributes(schema.value, item as IVEOCustomAspect, item.attributes)
      } else {
        updateLinkAttributes(schema.value, item as IVEOCustomLink, item.attributes)
      }
      objectSchemaDialog.value.value = false
      context.emit('schema-updated', schema.value)
    }

    return { hideEmptyAspects, search, itemContainsAttributeTitle, attributeContainsTitle, objectSchemaDialog, showAddDialog, doAddItem, showEditDialog, doEditItem, typeMap, basicProps, customAspects, customLinks }
  }
})
</script>

<style lang="scss" scoped>
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
