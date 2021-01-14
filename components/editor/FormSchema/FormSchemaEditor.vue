<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage
        v-if="!backlogCollapsed"
        absolute-size
        no-padding
        :cols="12"
        :md="8"
        :xl="8"
        sticky-header
      >
        <template #header>
          <h3 class="text-center pb-1">{{ $t('editor.formschema.controls.available') }}</h3>
          <v-text-field
            v-model="searchQuery"
            class="mb-1"
            dense
            flat
            clearable
            hide-details
            solo-inverted
            prepend-inner-icon="mdi-magnify"
            :label="$t('editor.formschema.search')"
          />
        </template>
        <template #default>
          <div class="pt-0 px-2 pb-2" style="height: 100%">
            <v-card flat style="height: 100%">
              <div v-show="!controlElementsVisible && searchQuery" class="text-center mt-1">
                <span class="text--disabled">{{ $t('editor.formschema.search.noMatch') }}</span>
              </div>
              <div v-show="controlElementsVisible" class="px-4 py-4">
                <v-btn
                  text
                  small
                  @click="onExpandAll"
                >
                  {{ $t('editor.formschema.backlog.button.expand') }}
                </v-btn>
                <v-btn
                  text
                  small
                  @click="onCollapseAll"
                >
                  {{ $t('editor.formschema.backlog.button.collapse') }}
                </v-btn>
              </div>
              <v-expansion-panels v-model="expansionPanels" accordion multiple flat>
                <v-expansion-panel v-show="filteredFormElements.length">
                  <v-expansion-panel-header
                    class="overline"
                  >
                    {{ $t('editor.formelements') }} ({{ filteredFormElements.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card outlined>
                      <v-list dense class="py-0">
                        <Draggable
                          class="drag-form-elements"
                          tag="div"
                          style="overflow: auto; min-width:300;"
                          :list="filteredFormElements"
                          :group="{ name: 'g1', pull: 'clone', put: false }"
                          :sort="false"
                          :clone="onCloneFormElement"
                        >
                          <v-sheet v-for="(el, i) in filteredFormElements" :key="i">
                            <FormSchemaEditorListItem
                              :title="el.description.title"
                              :styling="el.description"
                            />
                          </v-sheet>
                        </Draggable>
                      </v-list>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel v-show="filteredBasics.length">
                  <v-expansion-panel-header
                    class="overline"
                  >
                    {{ $t('editor.basicproperties') }} ({{ filteredBasics.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card v-show="filteredBasics.length" outlined>
                      <v-list dense class="py-0">
                        <Draggable
                          class="drag-unused-basic-properties"
                          tag="div"
                          style="overflow: auto; min-width:300;"
                          :list="filteredBasics"
                          :group="{ name: 'g1', pull: 'clone', put: false }"
                          :sort="false"
                          :clone="onCloneControl"
                        >
                          <v-sheet v-for="(el, i) in filteredBasics" :key="i">
                            <FormSchemaEditorListItem
                              :title="el.backlogTitle"
                              :styling="typeMap[el.type]"
                            />
                          </v-sheet>
                        </Draggable>
                      </v-list>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel v-show="filteredAspects.length">
                  <v-expansion-panel-header
                    class="overline"
                  >
                    {{ $t('editor.customaspects') }} ({{ filteredAspects.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card v-if="filteredAspects.length" outlined>
                      <v-list dense class="py-0">
                        <Draggable
                          class="drag-unused-aspects"
                          tag="div"
                          style="overflow: auto; min-width:300;"
                          :list="filteredAspects"
                          :group="{ name: 'g1', pull: 'clone', put: false }"
                          :sort="false"
                          :clone="onCloneControl"
                        >
                          <v-sheet v-for="(el, i) in filteredAspects" :key="i">
                            <FormSchemaEditorListItem
                              :title="el.backlogTitle"
                              :styling="typeMap[el.type]"
                            />
                          </v-sheet>
                        </Draggable>
                      </v-list>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel v-show="filteredLinks.length">
                  <v-expansion-panel-header
                    class="overline"
                  >
                    {{ $t('editor.customlinks') }} ({{ filteredLinks.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card v-if="filteredLinks.length" outlined>
                      <v-list dense class="py-0">
                        <Draggable
                          class="drag-unused-links"
                          tag="div"
                          style="overflow: auto; min-width:300;"
                          :list="filteredLinks"
                          :group="{ name: 'g1', pull: 'clone', put: false }"
                          :sort="false"
                          :clone="onCloneControl"
                        >
                          <v-sheet v-for="(el, i) in filteredLinks" :key="i">
                            <FormSchemaEditorListItem
                              :title="el.backlogTitle"
                              :styling="typeMap[el.type]"
                            />
                          </v-sheet>
                        </Draggable>
                      </v-list>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </div>
        </template>
      </VeoPage>
      <v-divider vertical />
      <VeoPage
        absolute-size
        no-padding
        :fullsize="backlogCollapsed"
        :cols="12"
        :md="backlogCollapsed ? 12 : 8"
        :xl="backlogCollapsed ? 12 : 8"
        sticky-header
      >
        <template #header>
          <h3 class="text-center pb-1">{{ $t('editor.formschema.controls.current') }}</h3>
          <CollapseButton
            v-if="!$vuetify.breakpoint.xs"
            :value="backlogCollapsed"
            @input="$emit('toggle-backlog')"
          />
        </template>
        <template #default>
          <div class="fill-height fill-width d-flex pt-0 px-2 pb-2">
            <FseGenerator
              :schema="objectSchema"
              :value="value.content"
              @delete="onDelete"
              @update="onUpdate"
            />
          </div>
        </template>
      </VeoPage>
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import Draggable from 'vuedraggable'
import vjp from 'vue-json-pointer'
import { JsonPointer } from 'json-ptr'
import FseGenerator from './Generator/FseGenerator.vue'
import CollapseButton from '~/components/layout/CollapseButton.vue'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'

export interface IControl {
  scope: string
  // TODO: These types are assumed for us to describe easily property type, however e.g. "type: enum" does not exist in JSONSchema standard
  // Therefore, "type: enum", describes the JSONSchema element, which includes "enum: []"
  type: 'string' | 'boolean' | 'object' | 'number' | 'integer' | 'array' | 'enum' | 'null' | 'default'
  label: string
  backlogTitle: string
  propertyName: string
  category: 'basics' | 'aspects' | 'links'
  used: boolean
}

export interface IControlItem {
  [key: string]: IControl[]
}

export interface IUnused {
  basics: IControl[]
  aspects: IControl[]
  links: IControl[]
}

interface IProvide {
  controlsItems: IControlItem
}

export default Vue.extend({
  name: 'FormSchemaEditor',
  components: {
    Draggable,
    FseGenerator,
    VeoPage,
    CollapseButton,
    VeoPageWrapper
  },
  provide(): IProvide {
    return {
      controlsItems: this.controlsItems
    }
  },
  props: {
    objectSchema: Object,
    value: Object,
    backlogCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fab: false,
      searchQuery: '',
      formElements: [
        {
          type: 'Layout',
          options: {
            format: 'group'
          },
          elements: [],
          description: {
            title: 'group',
            icon: 'mdi-form-select',
            name: 'layout',
            color: 'grey darken-2'
          }
        },
        {
          type: 'Label',
          text: 'TEXT',
          options: {},
          description: {
            title: 'text',
            icon: 'mdi-format-text',
            name: 'label',
            color: 'grey darken-2'
          }
        }
      ],
      expansionPanels: [0, 1, 2, 3],
      controls: [] as IControl[],
      controlsItems: {} as IControlItem,
      objectSchemaPropertiesPatterns: {
        standard: ['#/properties/name', '#/properties/abbreviation', '#/properties/description'],
        regexAspectsAttributes: /^#\/properties\/customAspects\/properties\/\w+\/properties\/attributes\/properties\/\w+$/i,
        regexLinks: /^#\/properties\/links\/properties\/\w+$/i,
        regexLinksAttributes: /^#\/properties\/links\/properties\/\w+\/items\/properties\/attributes\/properties\/\w+$/i
      },
      typeMap: {
        string: {
          icon: 'mdi-alphabetical-variant',
          name: 'string',
          color: 'red'
        },
        boolean: {
          icon: 'mdi-check-box-outline',
          name: 'boolean',
          color: 'teal'
        },
        object: { icon: 'mdi-file-tree', name: 'object', color: 'indigo' },
        number: { icon: 'mdi-decimal', name: 'number', color: 'light-blue' },
        integer: { icon: 'mdi-numeric', name: 'integer', color: 'green' },
        array: { icon: 'mdi-view-list', name: 'array', color: 'amber' },
        enum: {
          icon: 'mdi-label-multiple',
          name: 'enum',
          color: 'light-green'
        },
        null: { icon: 'mdi-cancel', name: 'null', color: 'blue-grey' },
        default: { icon: 'mdi-help-box', name: 'unknown', color: 'grey' }
      }
    }
  },
  computed: {
    unused(): IUnused {
      return {
        basics: this.controls.filter(obj => obj.category === 'basics' && !obj.used),
        aspects: this.controls.filter(obj => obj.category === 'aspects' && !obj.used),
        links: this.controls.filter(obj => obj.category === 'links' && !obj.used)
      }
    },
    filteredBasics(): IControl[] {
      return this.unused.basics.filter(b => !this.searchQuery || b.label?.toLowerCase().includes(this.searchQuery))
    },
    filteredAspects(): IControl[] {
      return this.unused.aspects.filter(a => !this.searchQuery || a.label?.toLowerCase().includes(this.searchQuery))
    },
    filteredLinks(): IControl[] {
      return this.unused.links.filter(l => !this.searchQuery || l.label?.toLowerCase().includes(this.searchQuery))
    },
    filteredFormElements(): any {
      return this.formElements.filter(
        (f: any) => !this.searchQuery || f.description.title?.toLowerCase().includes(this.searchQuery)
      )
    },
    controlElementsVisible(): boolean {
      return !!(
        this.filteredFormElements.length +
        this.filteredBasics.length +
        this.filteredAspects.length +
        this.filteredLinks.length
      )
    }
  },
  watch: {
    objectSchema: {
      immediate: true,
      deep: true,
      handler() {
        const createControl = (key: string, value: any, category: IControl['category']): IControl => {
          const propertyName = key.split('/').slice(-1)[0]
          const label = propertyName.split('_').pop() || ''
          let backlogTitle = propertyName

          if (category !== 'basics') {
            backlogTitle = backlogTitle.replace(`${this.objectSchema.title.toLowerCase()}_`, '')
            backlogTitle = backlogTitle.replace('_', ' / ')
          }
          return {
            scope: key,
            type: Array.isArray(value.enum) ? 'enum' : value.type,
            label,
            backlogTitle,
            propertyName,
            category,
            used: false
          }
        }
        Object.entries(JsonPointer.flatten(this.objectSchema, true) as Record<string, any>).forEach(([key, value]) => {
          if (this.objectSchemaPropertiesPatterns.standard.includes(key)) {
            this.controls.push(createControl(key, value, 'basics'))
          } else if (this.objectSchemaPropertiesPatterns.regexAspectsAttributes.test(key)) {
            this.controls.push(createControl(key, value, 'aspects'))
          } else if (this.objectSchemaPropertiesPatterns.regexLinks.test(key)) {
            this.controls.push(createControl(key, value, 'links'))
          } else if (this.objectSchemaPropertiesPatterns.regexLinksAttributes.test(key)) {
            const [linksKey, linksAttribute] = key.split('/items/')
            if (!this.controlsItems[linksKey]) {
              this.controlsItems[linksKey] = []
            }
            this.controlsItems[linksKey].push(createControl(`#/${linksAttribute}`, value, 'links'))
          }
        })
      }
    },
    'value.content': {
      immediate: true,
      deep: true,
      handler() {
        const usedScopes = Object.entries(JsonPointer.flatten(this.value.content, true))
          .filter(([key, value]) => /\/scope$/i.test(key))
          .map(([key, value]) => value as string)

        this.controls.forEach((obj, i) => {
          if (usedScopes.includes(obj.scope)) {
            // if an element is used in FormSchema and "used" property is not true yet => set to true
            if (obj.used === false) {
              vjp.set(this.controls, `/${i}/used`, true)
            }
          } else if (obj.used === true) {
            // if an element is not in FormSchema anymore, but "used" property is true => set to false
            vjp.set(this.controls, `/${i}/used`, false)
          }
        })
      }
    }
  },
  methods: {
    onCloneFormElement(original: any) {
      // Return always new object reference on clone to get in issues of the same reference
      // https://github.com/SortableJS/Vue.Draggable/issues/203
      return JSON.parse(JSON.stringify(original))
    },
    onCloneControl(original: any) {
      const dataToClone: IControl = JSON.parse(JSON.stringify(original))
      return {
        type: 'Control',
        scope: dataToClone.scope,
        options: {
          label: dataToClone.label
        },
        ...(dataToClone.category === 'links' && { elements: [] })
      }
    },
    onDelete(_event: any): void {
      vjp.remove(this.value, '/content')
    },
    onUpdate(event: any): void {
      const element = vjp.get(this.value, `/content${event.formSchemaPointer}`)
      element.options = event.payload.options
      element.scope = event.payload.scope
      if (element.scope !== event.payload.scope) {
        // TODO: Implement
        /* vjp.set(this.value, event.payload.scope, element)
        vjp.remove(this.value, element.scope) */
      }
    },
    onCreateLabel() {
      const topLevelElements: any = JsonPointer.get(this.value, '#/content/elements')

      const initialLayout = {
        type: 'Label',
        text: 'Text',
        options: {}
      }

      if (Array.isArray(topLevelElements)) {
        topLevelElements.push(initialLayout)
      } else {
        vjp.set(this.value, '/content', initialLayout)
      }
    },
    onCreateLayout() {
      const topLevelElements: any = JsonPointer.get(this.value, '#/content/elements')

      const initialLayout = {
        type: 'Layout',
        options: {
          format: 'group'
        },
        elements: []
      }

      if (Array.isArray(topLevelElements)) {
        topLevelElements.push(initialLayout)
      } else {
        vjp.set(this.value, '/content', initialLayout)
      }
    },
    onExpandAll() {
      this.expansionPanels = [0, 1, 2, 3]
    },
    onCollapseAll() {
      this.expansionPanels = []
    }
  }
})
</script>
