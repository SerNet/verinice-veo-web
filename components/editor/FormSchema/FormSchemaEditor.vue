<template>
  <v-row no-gutters>
    <v-col cols="4">
      <v-card
        elevation="0"
        class="mt-2 mx-2 mb-2 drag-elements-wrapper"
        style="overflow: auto; height: calc(100vh - 202px);"
      >
        <!-- Form elements -->
        <div>
          <v-subheader class="px-2">Form Elements</v-subheader>
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
                <v-icon
                  small
                  dark
                  outlined
                  v-text="formElementsDescription[i].icon"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title
                  class="caption"
                  v-text="formElementsDescription[i].name"
                />
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
          <v-subheader class="px-2">Basic Properties</v-subheader>
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
                <v-chip
                  :color="typeMap[el.type].color"
                  class="mr-2"
                  small
                  label
                  outlined
                >
                  {{ el.type }}
                </v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-card>
        </Draggable>

        <!-- Unused Aspects -->
        <div v-if="unused.aspects.length > 0">
          <v-divider />
          <v-subheader class="px-2">Aspects</v-subheader>
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
                <v-list-item-title class="caption" v-text="el.label" />
              </v-list-item-content>
              <v-list-item-action class="ml-3">
                <v-chip
                  :color="typeMap[el.type].color"
                  class="mr-2"
                  small
                  label
                  outlined
                >
                  {{ el.type }}
                </v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-card>
        </Draggable>

        <!-- Unused Links -->
        <div v-if="unused.links.length > 0">
          <v-divider />
          <v-subheader class="px-2">Links</v-subheader>
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
                <v-list-item-title class="caption" v-text="el.label" />
              </v-list-item-content>
              <v-list-item-action class="ml-3">
                <v-chip
                  :color="typeMap[el.type].color"
                  class="mr-2"
                  small
                  label
                  outlined
                >
                  {{ el.type }}
                </v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-card>
        </Draggable>
      </v-card>
    </v-col>
    <v-col cols="8">
      <div
        class="veo-editor-body"
        style="overflow: auto; height: calc(100vh - 182px);"
      >
        <FseGenerator
          :schema="objectSchema"
          :value="value.content"
          @delete="onDelete"
          @update="onUpdate"
        />
        <!-- <v-speed-dial
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
        </v-speed-dial> -->
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import Draggable from 'vuedraggable'
// import NestedDraggable from '~/components/editor/FormSchema/NestedDraggable.vue'
import vjp from 'vue-json-pointer'
import { JsonPointer } from 'json-ptr'
import FseGenerator from './Generator/FseGenerator.vue'

export interface IControl {
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
          text: 'TEXT'
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
    },
    unused(): IUnused {
      return {
        basics: this.controls.filter(
          obj => obj.category === 'basics' && !obj.used
        ),
        aspects: this.controls.filter(
          obj => obj.category === 'aspects' && !obj.used
        ),
        links: this.controls.filter(
          obj => obj.category === 'links' && !obj.used
        )
      }
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

        let propertiesArray: any[] = []
        flattenedSchema.forEach(obj => {
          if (obj.scope.includes('#/properties/customAspects')) {
            propertiesArray.push({ ...obj, category: 'aspects', used: false })
          } else if (obj.scope.includes('#/properties/links')) {
            propertiesArray.push({ ...obj, category: 'links', used: false })
          } else {
            propertiesArray.push({ ...obj, category: 'basics', used: false })
          }
        })
        const links = propertiesArray.filter(obj => obj.category === 'links')

        // Get unique links
        const linksScopes = links
          .map(obj =>
            obj.scope
              .split('/')
              .slice(0, 5)
              .join('/')
          )
          .filter((el: string, i, arr) => arr.indexOf(el) === i)

        let propertiesItems: any = {}

        linksScopes.forEach((linksScope: string) => {
          // all links attributes
          propertiesItems[linksScope] = links
            .filter(obj => obj.scope.includes(linksScope))
            .map(obj => ({
              ...obj,
              scope: `#/${obj.scope
                .split('/')
                .slice(6)
                .join('/')}`
            }))
        })

        propertiesArray = [
          ...propertiesArray.filter(obj => obj.category !== 'links'),
          ...linksScopes.map((linksScope: string) => ({
            scope: linksScope,
            type: 'array',
            label: linksScope.split('/').slice(-1)[0],
            category: 'links',
            used: false
          }))
        ]

        this.controls = propertiesArray
        this.controlsItems = propertiesItems
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
          .map(([key, value]) => value as string)

        this.controls.forEach((obj, i) => {
          if (usedScopes.includes(obj.scope)) {
            // if an element is used in FormSchema and "used" property is not true yet => set to true
            if (obj.used === false) {
              vjp.set(this.controls, `/${i}/used`, true)
            }
          } else {
            if (obj.used === true) {
              // if an element is not in FormSchema anymore, but "used" property is true => set to false
              vjp.set(this.controls, `/${i}/used`, false)
            }
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
      const topLevelElements: any = JsonPointer.get(
        this.value,
        '#/content/elements'
      )

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

.drag-elements-wrapper {
  border: 2px solid $grey;
}

.veo-editor-body ::v-deep .v-card.vf-layout {
  border: 1px solid black !important;
}
.veo-editor-body ::v-deep .v-card.vf-label {
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
