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
              <ObjectSchemaListItem v-for="child in basicProps" :key="child.id" v-bind="child" two-line @click="editItem(child)" />
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header class="overline">
          Custom Aspects ({{ customAspects.length }})
          <div class="d-flex">
            <v-spacer />
            <v-btn small text color="primary" @click.stop>
              <v-icon small>mdi-plus</v-icon>
              <span>Add custom aspect</span>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card v-for="item in customAspects" v-show="!hideEmptyAspects || item.children.length > 0" :key="item.id" class="mb-2" outlined>
            <v-list class="py-0" dense>
              <ObjectSchemaListHeader v-bind="item" @click="editItem(item)" />
              <ObjectSchemaListItem v-for="child in item.children" :key="child.id" v-bind="child" two-line @click="editItem(item)" />
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
          <v-card v-for="item in customLinks" :key="item.id" class="mb-2" outlined>
            <v-list class="py-0" dense>
              <ObjectSchemaListHeader v-bind="item" @click="editItem(item)" />
              <ObjectSchemaListItem v-for="child in item.children" :key="child.id" v-bind="child" two-line @click="editItem(item)" />
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <ObjectSchemaDialog v-model="showObjectSchemaDialog" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive } from '@nuxtjs/composition-api'
import { JSONSchema7, JSONSchema7Object, JSONSchema7TypeName } from 'json-schema'

interface ITypeInfo {
  name: string
  color: string
  icon: string
}

interface IProps {
  value: JSONSchema7
}

export default defineComponent<IProps>({
  props: {
    value: { type: Object, required: true }
  },
  setup(props) {
    const CUSTOM_ASPECTS_NAME = 'customAspects'
    const CUSTOM_ASPECT_ATTRIBUTES = 'attributes'
    const CUSTOM_LINKS_NAME = 'links'

    const search = ref('')
    const hideEmptyAspects = ref(true)
    const showObjectSchemaDialog = ref(false)

    const typeMap: Record<JSONSchema7TypeName | 'enum' | 'default', ITypeInfo> = {
      string: { icon: 'mdi-alphabetical-variant', name: 'string', color: 'red' },
      boolean: { icon: 'mdi-check-box-outline', name: 'boolean', color: 'teal' },
      object: { icon: 'mdi-file-tree', name: 'object', color: 'indigo' },
      number: { icon: 'mdi-decimal', name: 'number', color: 'light-blue' },
      integer: { icon: 'mdi-numeric', name: 'integer', color: 'green' },
      array: { icon: 'mdi-view-list', name: 'array', color: 'amber' },
      enum: { icon: 'mdi-label-multiple', name: 'enum', color: 'light-green' },
      null: { icon: 'mdi-cancel', name: 'null', color: 'blue-grey' },
      default: { icon: 'mdi-help-box', name: 'unknown', color: 'grey' }
    }

    function parseProperties(obj: JSONSchema7) {
      const props = (obj.properties || {}) as Record<string, any>
      return Object.keys(props).map((attr) => {
        const attrib = props[attr as keyof typeof props] as JSONSchema7
        const type = attrib?.type || (attrib?.enum ? 'enum' : 'default')
        const typeName = typeof type === 'string' ? type : 'default'
        const t = typeMap[typeName]
        return {
          id: attr,
          name: attr,
          color: t?.color,
          type: t?.name,
          icon: t?.icon,
          title: attrib?.title,
          description: attrib?.description,
          labels: typeMap[typeName] ? [typeMap[typeName]] : []
        }
      })
    }

    function createCaseInsensitiveMatcher(needle: string) {
      const lc = String(needle || '').toLowerCase()
      return function(haystack: string) {
        return String(haystack || '')
          .toLowerCase()
          .includes(lc)
      }
    }

    function extractAttributes(treeName: string, nodeName: string = 'attributes', treeAttrs?: (node: JSONSchema7) => object) {
      const customAspects = props.value.properties?.[treeName] as JSONSchema7
      const aspects = customAspects?.properties || {}
      const matcher = createCaseInsensitiveMatcher(search.value)
      return Object.keys(aspects).map((k) => {
        const aspect = (aspects[k] as JSONSchema7) || {}
        const props = aspect?.properties || {}
        const attribs = (props?.[nodeName] as JSONSchema7) || {}
        return {
          id: k,
          name: k,
          ...treeAttrs?.(aspect),
          children: parseProperties(attribs).filter(p => matcher(p.id))
        }
      })
    }

    function editItem(keys: string[]) {
      showObjectSchemaDialog.value = true
      console.log('ITEM', keys)
    }

    const basicProps = computed(() => {
      const matcher = createCaseInsensitiveMatcher(search.value)
      return parseProperties(props.value)
        .filter(p => ![CUSTOM_ASPECTS_NAME, CUSTOM_LINKS_NAME].includes(p.id) && matcher(p.id))
        .map(p => ({ ...p, path: [p.id] }))
    })

    const customAspects = computed(() =>
      extractAttributes(CUSTOM_ASPECTS_NAME, CUSTOM_ASPECT_ATTRIBUTES, (node: any) => ({
        labels: []
      })).map(p => ({ ...p, path: [CUSTOM_ASPECTS_NAME, p.id] }))
    )
    const customLinks = computed(() =>
      extractAttributes(CUSTOM_LINKS_NAME, CUSTOM_ASPECT_ATTRIBUTES, (node: any) => ({
        labels: [{ name: '→ ' + node?.items?.properties?.target?.properties?.type?.enum?.[0], color: 'black' }]
      }))
    )

    return { showObjectSchemaDialog, hideEmptyAspects, search, basicProps, customAspects, customLinks, editItem }
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
