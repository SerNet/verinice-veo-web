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
              <v-list-item />
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
            <v-btn small text color="primary" @click.stop="showAddAspect()">
              <v-icon small>mdi-plus</v-icon>
              <span>Add custom aspect</span>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card v-for="(aspect, index) of customAspects" v-show="!hideEmptyAspects || aspect.item.attributes.length > 0" :key="index" class="mb-2" outlined>
            <v-list class="py-0" dense>
              <ObjectSchemaListHeader v-bind="aspect" @click="showEditAspect(aspect)" />
              <ObjectSchemaListItem v-for="(attribute, index2) of aspect.item.attributes" :key="index2" :item="attribute" :styling="typeMap[attribute.type]" two-line @click="showEditAspect(aspect)" />
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline">
          Custom Links ({{ customLinks.length }})
          <div class="d-flex">
            <v-spacer />
            <v-btn small text color="primary" @click.stop>
              <v-icon small>mdi-plus</v-icon>
              <span>Add custom link</span>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card v-for="(link, index) of customLinks" :key="index" class="mb-2" outlined>
            <v-list class="py-0" dense>
              <ObjectSchemaListHeader v-bind="link" :styling="{ name: link.item.raw.items.properties.target.properties.type.enum[0], color: 'black' }" @click="showEditAspect(link)" />
              <ObjectSchemaListItem v-for="(attribute, index2) of link.item.attributes" :key="index2" :item="attribute" :styling="typeMap[attribute.type]" two-line @click="showEditAspect(link)" />
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <ObjectSchemaDialog v-model="objectSchemaDialog.value" :aspect="objectSchemaDialog.aspect" :mode="objectSchemaDialog.mode" :type-map="typeMap" @create-node="doAddAspect" @save-node="doEditAspect" />
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, ref, Ref, watch } from '@nuxtjs/composition-api'

import { VEOObjectSchemaRAW, VEOTypeNameRAW } from 'veo-objectschema-7'
import { addAspectToSchema, generateAspect, getAspects, getBasicProperties, getLinks, updateAspectAttributes, VEOCustomLink, VEOCustomAspect, VEOBasicProperty, getAspect } from '~/lib/ObjectSchemaHelper'

export interface ITypeInfo {
  name: string
  color: string
  icon: string
}

interface IProps {
  value: VEOObjectSchemaRAW
}

interface EditorPropertyItem {
  item: VEOCustomLink | VEOCustomAspect | VEOBasicProperty
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

    /**
     * schema related stuff
     */
    // @ts-ignore
    const schema: Ref<VEOObjectSchemaRAW> = ref(props.value)

    watch(() => props.value, (val: VEOObjectSchemaRAW) => {
      schema.value = val
    }, { deep: true })

    const customAspects: ComputedRef<EditorPropertyItem[]> = computed(() => {
      return getAspects(schema.value).map((entry: VEOCustomAspect) => {
        return {
          item: entry,
          styling: undefined
        }
      })
    })
    const customLinks: ComputedRef<EditorPropertyItem[]> = computed(() => {
      return getLinks(schema.value).map((entry: VEOCustomLink) => {
        return {
          item: entry,
          styling: undefined
        }
      })
    })
    const basicProps: ComputedRef<EditorPropertyItem[]> = computed(() => {
      return getBasicProperties(schema.value).map((entry: VEOBasicProperty) => {
        return {
          item: entry,
          styling: typeMap.value[entry.type]
        }
      })
    })

    /**
     * Editing customAspects
     */
    const objectSchemaDialog = ref({ value: false, aspect: {} as any, mode: ('create' || 'edit') })

    function showAddAspect() {
      objectSchemaDialog.value.mode = 'create'
      objectSchemaDialog.value.value = true
      objectSchemaDialog.value.aspect = undefined
    }

    function doAddAspect(form: { name: string }) {
      const newAspect = generateAspect(form.name)
      addAspectToSchema(schema.value, newAspect)

      objectSchemaDialog.value.aspect = getAspect(schema.value, newAspect.properties.type.enum[0])
      showEditAspect(objectSchemaDialog.value.aspect)
    }

    function showEditAspect(aspect: VEOCustomAspect) {
      objectSchemaDialog.value.mode = 'edit'
      objectSchemaDialog.value.aspect = aspect
      objectSchemaDialog.value.value = true
    }

    function doEditAspect(_aspect: VEOCustomAspect) {
      updateAspectAttributes(schema.value, _aspect, _aspect.attributes)
      objectSchemaDialog.value.value = false
      context.emit('schema-updated', schema.value)
    }

    return { hideEmptyAspects, search, objectSchemaDialog, showAddAspect, doAddAspect, showEditAspect, doEditAspect, typeMap, basicProps, customAspects, customLinks }
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
