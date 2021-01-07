<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage v-if="!backlogCollapsed" absolute-size no-padding :cols="12" :md="8" :xl="8" sticky-header>
        <template #header>
          <h3 class="text-center pb-1">{{ $t('editor.formschema.controls.available') }}</h3>
        </template>
        <template #default>
          <div class="pt-0 px-2 pb-2" style="height: 100%">
            <v-card flat class="backlog-wrapper" style="height: 100%">
              <div class="px-4 py-4">
                <v-btn text small @click="onExpandAll">{{ $t('editor.formschema.backlog.button.expand') }}</v-btn>
                <v-btn text small @click="onCollapseAll">{{ $t('editor.formschema.backlog.button.collapse') }}</v-btn>
              </div>
              <v-expansion-panels accordion multiple v-model="expansionPanels" flat>
                <v-expansion-panel>
                  <v-expansion-panel-header class="overline">
                    {{ $t('editor.formelements') }} ({{ formElements.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card outlined v-if="formElements.length > 0">
                      <v-list class="py-0">
                        <Draggable
                          class="drag-form-elements"
                          tag="div"
                          style="overflow: auto; min-width:300;"
                          :list="formElements"
                          :group="{ name: 'g1', pull: 'clone', put: false }"
                          :sort="false"
                          :clone="onCloneFormElement"
                        >
                          <v-card v-for="(el, i) in formElements" :key="i" flat>
                            <FormSchemaEditorListItem
                              :title="formElementsDescription[i].title"
                              :styling="formElementsDescription[i]"
                            />
                          </v-card>
                        </Draggable>
                      </v-list>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header class="overline">
                    {{ $t('editor.basicproperties') }} ({{ unused.basics.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card outlined v-if="unused.basics.length > 0">
                      <v-list class="py-0">
                        <Draggable
                          class="drag-unused-basic-properties"
                          tag="div"
                          style="overflow: auto; min-width:300;"
                          :list="unused.basics"
                          :group="{ name: 'g1', pull: 'clone', put: false }"
                          :sort="false"
                          :clone="onCloneControl"
                        >
                          <v-card v-for="(el, i) in unused.basics" :key="i" flat>
                            <FormSchemaEditorListItem :title="el.label" :styling="typeMap[el.type]" />
                          </v-card>
                        </Draggable>
                      </v-list>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header class="overline">
                    {{ $t('editor.customaspects') }} ({{ unused.aspects.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card outlined v-if="unused.aspects.length > 0">
                      <v-list class="py-0">
                        <Draggable
                          class="drag-unused-aspects"
                          tag="div"
                          style="overflow: auto; min-width:300;"
                          :list="unused.aspects"
                          :group="{ name: 'g1', pull: 'clone', put: false }"
                          :sort="false"
                          :clone="onCloneControl"
                        >
                          <v-card v-for="(el, i) in unused.aspects" :key="i" flat>
                            <FormSchemaEditorListItem :title="el.label" :styling="typeMap[el.type]" />
                          </v-card>
                        </Draggable>
                      </v-list>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-header class="overline">
                    {{ $t('editor.customlinks') }} ({{ unused.links.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card outlined v-if="unused.links.length > 0">
                      <v-list class="py-0">
                        <Draggable
                          class="drag-unused-links"
                          tag="div"
                          style="overflow: auto; min-width:300;"
                          :list="unused.links"
                          :group="{ name: 'g1', pull: 'clone', put: false }"
                          :sort="false"
                          :clone="onCloneControl"
                        >
                          <v-card v-for="(el, i) in unused.links" :key="i" flat>
                            <FormSchemaEditorListItem :title="el.label" :styling="typeMap[el.type]" />
                          </v-card>
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
          <div v-if="!$vuetify.breakpoint.xs" class="veo-collapse-editor pa-1">
            <v-btn icon x-small @click="$emit('toggle-backlog')">
              <v-icon v-if="!$props.backlogCollapsed">mdi-chevron-left</v-icon>
              <v-icon v-else>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </template>
        <template #default>
          <div class="veo-editor-body d-flex pt-0 px-2 pb-2" style="height: 100%">
            <FseGenerator :schema="objectSchema" :value="value.content" @delete="onDelete" @update="onUpdate" />
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
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'

export interface IControl {
  scope: string
  // TODO: These types are assumed for us to describe easily property type, however e.g. "type: enum" does not exist in JSONSchema standard
  // Therefore, "type: enum", describes the JSONSchema element, which includes "enum: []"
  type: 'string' | 'boolean' | 'object' | 'number' | 'integer' | 'array' | 'enum' | 'null' | 'default'
  label: string
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
    VeoPage
  },
  props: {
    objectSchema: Object,
    value: Object,
    backlogCollapsed: {
      type: Boolean,
      default: false
    }
  },
  provide(): IProvide {
    return {
      controlsItems: this.controlsItems
    }
  },
  data() {
    return {
      fab: false,
      formElements: [
        {
          type: 'Layout',
          options: {
            format: 'group'
          },
          elements: []
        },
        {
          type: 'Label',
          text: 'TEXT',
          options: {}
        }
      ],
      formElementsDescription: [
        {
          title: 'group',
          icon: 'mdi-form-select',
          name: 'layout',
          color: 'grey darken-2'
        },
        {
          title: 'text',
          icon: 'mdi-format-text',
          name: 'label',
          color: 'grey darken-2'
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
    }
  },
  watch: {
    objectSchema: {
      immediate: true,
      deep: true,
      handler() {
        const createControl = (key: string, value: any, category: IControl['category']): IControl => {
          const propertyName = key.split('/').slice(-1)[0]
          const label =
            category !== 'basics'
              ? propertyName
                  .split('_')
                  .slice(1)
                  .join('/')
              : propertyName
          return {
            scope: key,
            type: Array.isArray(value.enum) ? 'enum' : value.type,
            label,
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

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-collapse-editor {
  background-color: rgb(245, 245, 245);
  border-bottom-right-radius: 4px;
  border-top-right-radius: 4px;
  position: absolute;
  left: 0;
  top: 0;
}

.backlog-wrapper {
  border: 1px solid $grey;
}

.veo-editor-body {
  width: 100%;
}
</style>
