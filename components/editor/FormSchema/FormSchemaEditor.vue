<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage v-if="!backlogCollapsed" absolute-size no-padding :cols="12" :md="8" :xl="8" sticky-header>
        <template #header>
          <h3 class="text-center pb-1">{{ $t('editor.formschema.controls.available') }}</h3>
        </template>
        <template #default>
          <v-card flat class="mt-0 mx-2 mb-2 backlog-wrapper">
            <!-- Form elements -->
            <div>
              <v-subheader class="px-2">{{ $t('editor.formelements') }}</v-subheader>
              <v-divider />
            </div>
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
                <v-list-item class="pa-1" flat>
                  <v-list-item-avatar color="grey darken-2" size="32">
                    <v-icon small dark outlined v-text="formElementsDescription[i].icon" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="caption" v-text="formElementsDescription[i].name" />
                  </v-list-item-content>
                  <v-list-item-action class="ml-3">
                    <v-chip class="mr-2" color="grey darken-2" small label outlined>
                      {{ formElementsDescription[i].group }}
                    </v-chip>
                  </v-list-item-action>
                </v-list-item>
              </v-card>
            </Draggable>

            <!-- Unused Basic Properties -->
            <div v-if="unused.basics.length > 0">
              <v-divider />
              <v-subheader class="px-2">{{ $t('editor.basicproperties') }}</v-subheader>
              <v-divider />
            </div>
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
                <v-list-item class="pa-1" flat>
                  <v-list-item-avatar size="32" :color="typeMap[el.type].color">
                    <v-icon small outlined dark v-text="typeMap[el.type].icon" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="caption" v-text="el.label" />
                  </v-list-item-content>
                  <v-list-item-action class="ml-3">
                    <v-chip :color="typeMap[el.type].color" class="mr-2" small label outlined>
                      {{ el.type }}
                    </v-chip>
                  </v-list-item-action>
                </v-list-item>
              </v-card>
            </Draggable>

            <!-- Unused Aspects -->
            <div v-if="unused.aspects.length > 0">
              <v-divider />
              <v-subheader class="px-2">{{ $t('editor.customaspects') }}</v-subheader>
              <v-divider />
            </div>
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
                <v-list-item class="pa-1" flat>
                  <v-list-item-avatar size="32" :color="typeMap[el.type].color">
                    <v-icon small outlined dark v-text="typeMap[el.type].icon" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="caption aspects-title"
                      ><span>{{ el.label.split('_')[1] }}</span
                      ><span>/</span><span>{{ el.label.split('_')[2] }}</span></v-list-item-title
                    >
                  </v-list-item-content>
                  <v-list-item-action class="ml-3">
                    <v-chip :color="typeMap[el.type].color" class="mr-2" small label outlined>
                      {{ el.type }}
                    </v-chip>
                  </v-list-item-action>
                </v-list-item>
              </v-card>
            </Draggable>

            <!-- Unused Links -->
            <div v-if="unused.links.length > 0">
              <v-divider />
              <v-subheader class="px-2">{{ $t('editor.customlinks') }}</v-subheader>
              <v-divider />
            </div>
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
                <v-list-item class="pa-1" flat>
                  <v-list-item-avatar size="32" :color="typeMap[el.type].color">
                    <v-icon small outlined dark v-text="typeMap[el.type].icon" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="caption" v-text="el.label.split('_')[1]" />
                  </v-list-item-content>
                  <v-list-item-action class="ml-3">
                    <v-chip :color="typeMap[el.type].color" class="mr-2" small label outlined>
                      {{ el.type }}
                    </v-chip>
                  </v-list-item-action>
                </v-list-item>
              </v-card>
            </Draggable>
          </v-card>
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
          name: 'group',
          group: 'layout',
          icon: 'mdi-form-select'
        },
        {
          name: 'text',
          group: 'label',
          icon: 'mdi-format-text'
        }
      ],
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
          return {
            scope: key,
            type: Array.isArray(value.enum) ? 'enum' : value.type,
            label: key.split('/').slice(-1)[0],
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

.backlog-wrapper .aspects-title {
  & > span:first-child,
  & > span:nth-child(2) {
    color: $accent;
  }

  & > span:nth-child(2) {
    padding: 0 4px;
  }
}
</style>
