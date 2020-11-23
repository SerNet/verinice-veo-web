<template>
  <div>
    <div class="px-5 py-4 veo-editor-header">
      <v-expansion-panels accordion>
        <v-expansion-panel>
          <v-expansion-panel-header class="pa-2">
            Unused Basic Properties
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <Draggable
              class="drag-unused-basic-properties"
              tag="div"
              style="overflow: auto; min-width:300;"
              :list="objectSchemaProperties.basics.unused"
              :group="{ name: 'g1', put: false }"
              :sort="false"
            >
              <v-card
                class="ma-1 pa-1"
                v-for="(el, i) in objectSchemaProperties.basics.unused"
                flat
                :key="i"
              >
                <v-row no-gutters>
                  <v-col cols="auto">
                    <v-avatar
                      :color="typeMap[el.type].color"
                      size="32"
                      class="mr-2"
                    >
                      <v-icon small dark>
                        {{ typeMap[el.type].icon }}
                      </v-icon>
                    </v-avatar>
                  </v-col>
                  <v-col cols="auto">
                    {{ el.label }}
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col cols="auto">
                    <v-chip :color="typeMap[el.type].color" outlined label pill>
                      {{ el.type }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-card>
            </Draggable>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="pa-2">
            Unused Aspects
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <Draggable
              class="drag-unused-aspects"
              tag="div"
              style="overflow: auto; min-width:300;"
              :list="objectSchemaProperties.aspects.unused"
              :group="{ name: 'g1', put: false }"
              :sort="false"
            >
              <v-card
                class="ma-1 pa-1"
                v-for="(el, i) in objectSchemaProperties.aspects.unused"
                flat
                :key="i"
              >
                <v-row no-gutters>
                  <v-col cols="auto">
                    <v-avatar
                      :color="typeMap[el.type].color"
                      size="32"
                      class="mr-2"
                    >
                      <v-icon small dark>
                        {{ typeMap[el.type].icon }}
                      </v-icon>
                    </v-avatar>
                  </v-col>
                  <v-col cols="auto">
                    {{ el.label }}
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col cols="auto">
                    <v-chip :color="typeMap[el.type].color" outlined label pill>
                      {{ el.type }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-card>
            </Draggable>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="pa-2">
            Unused Links
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <Draggable
              class="drag-unused-links"
              tag="div"
              style="overflow: auto; min-width:300;"
              :list="objectSchemaProperties.links.unused"
              :group="{ name: 'g1', put: false }"
              :sort="false"
            >
              <v-card
                class="ma-1 pa-1"
                v-for="(el, i) in objectSchemaProperties.links.unused"
                flat
                :key="i"
              >
                <v-row no-gutters>
                  <v-col cols="auto">
                    <v-avatar
                      :color="typeMap[el.type].color"
                      size="32"
                      class="mr-2"
                    >
                      <v-icon small dark>
                        {{ typeMap[el.type].icon }}
                      </v-icon>
                    </v-avatar>
                  </v-col>
                  <v-col cols="auto">
                    {{ el.label }}
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col cols="auto">
                    <v-chip :color="typeMap[el.type].color" outlined label pill>
                      {{ el.type }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-card>
            </Draggable>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <div class="veo-editor-body" style="height: 5000px;">
      <FseGenerator
        :schema="objectSchema"
        :value="value.content"
        :objectSchemaProperties.sync="objectSchemaProperties"
        @delete="onDelete"
      />
      <v-speed-dial
        v-model="fab"
        bottom
        absolute
        right
        direction="top"
        open-on-hover
        transition="scale-transition"
        fixed
        style="right: 50%;"
      >
        <template #activator>
          <v-btn v-model="fab" color="primary" dark small fab>
            <v-icon v-if="fab">
              mdi-close
            </v-icon>
            <v-icon v-else>
              mdi-plus
            </v-icon>
          </v-btn>
        </template>

        <div
          v-for="element in createElementActions"
          :key="element.name"
          class="fse-create-element"
        >
          <v-btn fab x-small @click="element.action">
            <v-icon>{{ element.icon }}</v-icon>
          </v-btn>
          <span class="fse-create-element-caption">{{ element.name }}</span>
        </div>
      </v-speed-dial>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Draggable from 'vuedraggable'
// import NestedDraggable from '~/components/editor/FormSchema/NestedDraggable.vue'
import FseGenerator from './Generator/FseGenerator.vue'
import vjp from 'vue-json-pointer'
import { JsonPointer } from 'json-ptr'

interface IControl {
  scope: string
  // TODO: These types are assumed for us to describe easily property type, however e.g. "type: enum" does not exist in JSONSchema standard
  // Therefore, "type: enum", describes the JSONSchema element, which includes "enum: []"
  type:
    | 'string'
    | 'boolean'
    | 'object'
    | 'number'
    | 'integer'
    | 'array'
    | 'enum'
    | 'null'
    | 'default'
  label: string
}

export interface IControlLink extends IControl {
  elements: IControl[]
}

export interface IUsedAndUnusedProperties<T> {
  unused: T
  used: T
}

export interface IObjectSchemaProperties {
  basics: IUsedAndUnusedProperties<IControl[]>
  aspects: IUsedAndUnusedProperties<IControl[]>
  links: IUsedAndUnusedProperties<IControlLink[]>
}

export default Vue.extend({
  name: 'FormSchemaEditor',
  components: {
    Draggable,
    FseGenerator
  },
  props: {
    objectSchema: Object,
    value: Object
  },
  data() {
    return {
      fab: false,
      objectSchemaProperties: {
        basics: { unused: [], used: [] },
        aspects: { unused: [], used: [] },
        links: { unused: [], used: [] }
      } as IObjectSchemaProperties,
      objectSchemaPropertiesPatterns: {
        standard: [
          '#/properties/name',
          '#/properties/abbreviation',
          '#/properties/description'
        ],
        regexAspectsAttributes: /^#\/properties\/customAspects\/properties\/\w+\/properties\/attributes\/properties\/\w+$/i,
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
    createElementActions(): any {
      return [
        { name: 'Label', icon: 'mdi-format-text', action: this.onCreateLabel },
        {
          name: 'Control',
          icon: 'mdi-form-textbox-password',
          action: this.onCreateControl
        },
        {
          name: 'Layout',
          icon: 'mdi-form-select',
          action: this.onCreateLayout
        },
        {
          name: 'Page',
          icon: 'mdi-book-open-page-variant',
          action: this.onCreatePage
        }
      ]
    }
  },
  watch: {
    objectSchema: {
      immediate: true,
      deep: true,
      handler() {
        const flattenedSchema = Object.entries(
          JsonPointer.flatten(this.objectSchema, true) as Record<string, any>
        )
          .filter(([key, value]) => {
            return (
              this.objectSchemaPropertiesPatterns.standard.includes(key) ||
              this.objectSchemaPropertiesPatterns.regexAspectsAttributes.test(
                key
              ) ||
              this.objectSchemaPropertiesPatterns.regexLinksAttributes.test(key)
            )
          })
          .map(([key, value]) => {
            if (Array.isArray(value.enum)) {
              return {
                scope: key,
                type: 'enum',
                label: key.split('/').slice(-1)[0]
              }
            } else {
              return {
                scope: key,
                type: value.type,
                label: key.split('/').slice(-1)[0]
              }
            }
          })

        const properties = { basics: [], aspects: [], links: [] } as {
          basics: any[]
          aspects: any[]
          links: any[]
        }

        flattenedSchema.forEach(obj => {
          if (obj.scope.includes('#/properties/customAspects')) {
            properties.aspects.push(obj)
          } else if (obj.scope.includes('#/properties/links')) {
            properties.links.push(obj)
          } else {
            properties.basics.push(obj)
          }
        })

        // Get unique links
        const linksScopes = properties.links
          .map(obj =>
            obj.scope
              .split('/')
              .slice(0, 5)
              .join('/')
          )
          .filter((el: string, i, arr) => arr.indexOf(el) === i)

        // Wrap link attributes with their parent Links
        properties.links = linksScopes.map((linksScope: string) => {
          // all links attributes
          return {
            scope: linksScope,
            type: 'array',
            label: linksScope.split('/').slice(-1)[0],
            elements: properties.links
              .filter(obj => obj.scope.includes(linksScope))
              .map(obj => ({
                ...obj,
                scope: `#/${obj.scope
                  .split('/')
                  .slice(6)
                  .join('/')}`
              }))
          }
        })

        this.objectSchemaProperties = {
          basics: { unused: properties.basics, used: [] },
          aspects: { unused: properties.aspects, used: [] },
          links: { unused: properties.links, used: [] }
        }

        console.log(flattenedSchema, properties)
      }
    },
    'value.content': {
      immediate: true,
      deep: true,
      handler() {
        const usedScopes = Object.entries(
          JsonPointer.flatten(this.value.content, true)
        )
          .filter(([key, value]) => /\/scope$/i.test(key))
          .map(([key, value]) => value)

        const objectSchemaPropertiesPointers = Object.entries(
          JsonPointer.flatten(this.objectSchemaProperties, true)
        )
          .filter(([key, value]) => /#\/\w+\/unused\/.*\/scope$/i.test(key))
          .filter(([key, value]) => usedScopes.includes(value))

        objectSchemaPropertiesPointers.forEach(([key, value]) => {
          const pointerToObject = key.replace('/scope', '')
          const unusedObject = JsonPointer.get(
            this.objectSchemaProperties,
            pointerToObject
          )

          vjp.set(
            this.objectSchemaProperties,
            pointerToObject.replace('#', '').replace('/unused/', '/used/'),
            unusedObject
          )

          vjp.remove(
            this.objectSchemaProperties,
            pointerToObject.replace('#', '')
          )
        })

        console.log(
          'Change Content',
          usedScopes,
          objectSchemaPropertiesPointers,
          this.objectSchemaProperties
        )
      }
    }
  },
  methods: {
    onDelete(event: any): void {
      vjp.remove(this.value, '/content')
    },
    onCreateLabel() {
      console.log('Create Label')
    },
    onCreateControl() {
      console.log('Create Control')
    },
    onCreateLayout() {
      const topLevelElements: any = JsonPointer.get(
        this.value,
        '#/content/elements'
      )

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
    onCreatePage() {
      console.log('Create Page')
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-editor-header {
  background-color: white;
  border-bottom: 2px solid $grey;
  position: sticky;
  top: 0;
  z-index: 2;
  max-height: 200px;
  overflow: auto;
}

.veo-editor-header ::v-deep .v-expansion-panel-header {
  min-height: auto;
}
.veo-editor-header
  ::v-deep
  .v-expansion-panel--active
  > .v-expansion-panel-header {
  min-height: auto;
}
.veo-editor-header ::v-deep .v-expansion-panel-content__wrap {
  padding: 0 0 8px 0;
}

.veo-editor-body ::v-deep .v-card.vf-layout {
  border: 1px solid black !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-string {
  border: 1px solid $color-string !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-boolean {
  border: 1px solid $color-boolean !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-number {
  border: 1px solid $color-number !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-integer {
  border: 1px solid $color-integer !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-object {
  border: 1px solid $color-object !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-array {
  border: 1px solid $color-array !important;
}
// TODO: Type: "enum" does not exist in JsonSchema Standard
.veo-editor-body ::v-deep .v-card.fse-os-enum {
  border: 1px solid $color-enum !important;
}
// TODO: Type: "enum" does not exist in JsonSchema Standard
.veo-editor-body ::v-deep .v-card.fse-os-null {
  border: 1px solid $color-null !important;
}

.fse-create-element {
  align-items: center;
  display: flex;
  position: relative;

  .fse-create-element-caption {
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.87);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 6px 12px;
    position: absolute;
    right: 52px; /* 40px is the width of the button next to it, 3*4px the offset. */
    white-space: nowrap;
  }
}
</style>
