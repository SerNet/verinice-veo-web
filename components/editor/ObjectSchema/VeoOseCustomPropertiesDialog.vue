<template>
  <VeoDialog v-model="dialog.value" :headline="headline" large persistent fixed-header>
    <template #default>
      <v-form v-model="form.valid" @submit.prevent="editedElement && editedElement.attributes ? saveNode() : createNode()">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.data.name"
              :label="`${$t('property_name')} *`"
              required
              :rules="form.rules.name"
              :prefix="prefix"
            />
          </v-col>
        </v-row>
        <v-row v-if="type === 'link'">
          <v-col class="py-0">
            <v-text-field
              v-model="form.data.description"
              :label="`${$t('link_description')} *`"
              required
              :rules="form.rules.description"
            />
          </v-col>
          <v-col :cols="4" class="py-0">
            <v-select
              v-model="form.data.targetType"
              :label="`${$t('link_type')} *`"
              :items="formattedObjectTypes"
              required
              :rules="form.rules.targetType"
            />
          </v-col>
        </v-row>
        <v-list v-if="editedElement" dense class="py-0">
          <template v-for="(attribute, index) of editedElement.attributes" class="veo-attribute-list-attribute my-2">
            <VeoOseCustomAspectAttribute
              v-bind="attribute"
              :key="index"
              :aspectName="aspectPrefix"
              @delete="removeAttribute(index)"
              @update="updateAttribute($event, index)"
            />
          </template>

          <v-list-item v-if="editedElement.attributes.length === 0">
            <v-list-item-content class="veo-attribute-list-no-content justify-center">
              {{ $t(`${type}_noproperties`) }}
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="veo-attribute-list-add-button">
            <v-list-item-action>
              <v-spacer />
              <v-btn color="primary" text @click="addAttribute()">
                <v-icon>mdi-plus-circle-outline</v-icon>
                <span class="ml-2">{{ $t('add_attribute') }}</span>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-alert v-if="duplicates.length > 0" type="error" class="mb-4 mt-6" border="left" colored-border>
          <span> {{ $t('duplicate_attributes') }}: </span>
          <ul>
            <li v-for="duplicate of duplicates" :key="duplicate">
              {{ duplicate }}
            </li>
          </ul>
        </v-alert>
      </v-form>
      <small>{{ $t('global.input.requiredfields') }}</small>
    </template>
    <template v-if="dialog.mode === 'create'" #dialog-options>
      <v-spacer />
      <v-btn text color="primary" :disabled="!form.valid" @click="createNode()">
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
    <template v-else #dialog-options>
      <v-btn color="primary" outlined @click="$emit('delete-item')">
        {{ $t(`delete_${type}`) }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="close()">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-btn text color="primary" :disabled="!form.valid || duplicates.length > 0" @click="saveNode()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import {
  capitalize,
  cloneDeep,
  trim
} from 'lodash'

import { ISchemaEndpoint } from '~/plugins/api/schema'

import {
  IVeoOSHCustomAspect,
  IVeoOSHCustomLink,
  IVeoOSHCustomProperty
} from '~/lib/ObjectSchemaHelper2'

interface IData {
  dialog: { value: boolean, mode: 'create' | 'edit' }
  noWatch: boolean
  form: {
    valid: boolean
    data: {
      description: string
      name: string
      targetType: string
    },
    rules: {
      description: ((input: string) => boolean)[]
      name: ((input: string) => boolean)[]
      targetType: ((input: string) => boolean)[]
    }
  },
  objectTypes: ISchemaEndpoint[]
  editedElement: undefined | IVeoOSHCustomAspect | IVeoOSHCustomLink,
  duplicates: string[]
}

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    item: {
      type: Object as Prop<undefined | IVeoOSHCustomAspect | IVeoOSHCustomLink>,
      default: undefined
    },
    mode: {
      type: String,
      default: 'create'
    },
    type: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialog: { value: false, mode: 'create' },
      noWatch: false,
      form: {
        valid: false,
        data: {
          name: '',
          targetType: '',
          description: ''
        },
        rules: {
          name: [(input: string) => trim(input).length > 0],
          description: [(input: string) => this.type === 'aspect' || trim(input).length > 0],
          targetType: [(input: string) => this.type === 'aspect' || trim(input).length > 0]
        }
      },
      objectTypes: [],
      editedElement: undefined,
      duplicates: []
    } as IData
  },
  async fetch() {
    this.objectTypes = await this.$api.schema.fetchAll()
  },
  computed: {
    headline(): string {
      if (this.dialog.mode === 'create') {
        return this.$t(`headline.${this.type}.create`) as string
      } else {
        return this.$t(`headline.${this.type}.edit`, {
          title: this.item?.title ? `"${this.item?.title}"` : ''
        }) as string
      }
    },
    prefix(): string {
      return this.item?.prefix ?? ''
    },
    aspectPrefix(): string {
      return `${this.prefix}${this.form.data.name}`
    },
    formattedObjectTypes(): { text: string, value: string }[] {
      return this.objectTypes.map((value: ISchemaEndpoint) => ({
        text: capitalize(value.schemaName),
        value: value.schemaName
      }))
    }
  },
  watch: {
    value(newValue: boolean) {
      this.noWatch = true
      this.dialog.value = newValue
      this.noWatch = false

      if(!newValue) {
        this.clearForm()
      } else if(this.editedElement) {
        this.form.data.name = this.editedElement.title

        if (this.type === 'link') {
          this.form.data.targetType = (this.editedElement as IVeoOSHCustomLink).targetType
          this.form.data.description = (this.editedElement as IVeoOSHCustomLink).description
        }
      }
    },
    'dialog.value'(newValue: boolean) {
      if (!this.noWatch) {
        this.$emit('input', newValue)
      }
    },
    mode(newValue: 'create' | 'edit') {
      this.dialog.mode = newValue
    },
    item(newValue: undefined | IVeoOSHCustomAspect | IVeoOSHCustomLink) {
      this.editedElement = cloneDeep(newValue)

      // If the item is not undefined, set form data
      if(newValue) {
        this.form.data.name = newValue.title

        if (this.type === 'link') {
          this.form.data.targetType = (newValue as IVeoOSHCustomLink).targetType
          this.form.data.description = (newValue as IVeoOSHCustomLink).description
        }
      } else {
        this.clearForm()
      }
    }
  },
  methods: {
    close() {
      this.$emit('input', false)
    },
    clearForm() {
      this.form.data = {
        name: '',
        targetType: '',
        description: ''
      }
    },
    createNode() {
      this.$emit('create-node', this.form.data)
    },
    saveNode() {
      this.$emit('save-node', {
        item: { ...this.editedElement, ...this.form.data, title: this.form.data.name },
        id: this.item?.title
      })
    },
    addAttribute() {
      if(this.editedElement) {
        this.editedElement.attributes.push({
          type: 'string',
          title: '',
          description: ''
        })
      }
    },
    removeAttribute(index: number) {
      if(this.editedElement) {
        this.editedElement?.attributes.splice(index, 1)
      }
    },
    updateAttribute(newValues: IVeoOSHCustomProperty, index: number) {
      if(this.editedElement) {
        this.editedElement.attributes[index] = newValues
        // We need to completely overwrite the object, else vue won't pick up the changes
        this.editedElement.attributes = JSON.parse(JSON.stringify(this.editedElement.attributes))

        this.checkForDuplicate()
      }
    },
    checkForDuplicate() {
      this.duplicates = []
      if (this.editedElement) {
        for(let attribute1 of this.editedElement.attributes) {
          if (this.editedElement.attributes.filter((attribute2: IVeoOSHCustomProperty) => attribute2.title.toLowerCase() === attribute1.title.toLowerCase()).length > 1) {
            const duplicateTitle = attribute1.title.toLowerCase()
            if (!this.duplicates.includes(duplicateTitle)) {
              this.duplicates.push(duplicateTitle)
            }
          }
        }
      }
    }
  },
  mounted() {
    this.dialog.value = this.value
  }
})
</script>

<i18n>
{
  "en": {
    "add_attribute": "Add attribute",
    "aspect_noproperties": "This aspect has no attributes",
    "delete_aspect": "Delete aspect",
    "delete_link": "Delete link",
    "duplicate_attributes": "Attribute titles have to be unique in an aspect or link",
    "headline.aspect.create": "Create custom aspect",
    "headline.aspect.edit": "Edit aspect \"{title}\"",
    "headline.link.create": "Create custom link",
    "headline.link.edit": "Edit custom link {title}",
    "link_description": "Description",
    "link_noproperties": "This link has no attributes",
    "link_type": "Link type",
    "property_name": "Title"
  },
  "de": {
    "add_attribute": "Attribut hinzufügen",
    "aspect_noproperties": "Dieser Aspekt besitzt keine Attribute",
    "delete_aspect": "Aspekt löschen",
    "delete_link": "Link löschen",
    "duplicate_attributes": "Es kann immer nur ein Attribut mit den folgende(n) Titel(n) existieren",
    "headline.aspect.create": "Individuellen Aspekt erstellen",
    "headline.aspect.edit": "Aspekt {title} bearbeiten",
    "headline.link.create": "Individuellen Link erstellen",
    "headline.link.edit": "Link {title} bearbeiten",
    "link_description": "Linkbeschreibung",
    "link_noproperties": "Dieser Link besitzt keine Attribute",
    "link_type": "Typ des Linkziels",
    "property_name": "Titel"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-attribute-list-no-content {
  font-size: 1.2rem;
  font-weight: bold;
}

.veo-attribute-list-add-button {
  background-color: $light-grey;
}
</style>
