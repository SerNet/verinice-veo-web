<template>
  <VeoDialog v-model="dialog.value" :headline="headline" large persistent fixed-header>
    <template #default>
      <v-form v-model="form.valid" @submit.prevent="editedElement && editedElement.attributes ? saveNode() : createNode()">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.data.name"
              :label="`${$t('propertyName')} *`"
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
              :label="`${$t('linkDescription')} *`"
              required
              :rules="form.rules.description"
            />
          </v-col>
          <v-col :cols="4" class="py-0">
            <v-select
              v-model="form.data.targetType"
              :label="`${$t('linkType')} *`"
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
              {{ $t(`noProperties.${type}`) }}
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="veo-attribute-list-add-button">
            <v-list-item-action>
              <v-spacer />
              <v-btn color="primary" text @click="addAttribute()">
                <v-icon>mdi-plus-circle-outline</v-icon>
                <span class="ml-2">{{ $t('addAttribute') }}</span>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-alert v-if="duplicates.length > 0" type="error" class="mb-4 mt-6" border="left" colored-border>
          <span> {{ $t('duplicateAttributes') }}: </span>
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
        {{ $t(`delete.${type}`) }}
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

import ObjectSchemaHelper, {
  IVeoOSHCustomAspect,
  IVeoOSHCustomLink,
  IVeoOSHCustomProperty
} from '~/lib/ObjectSchemaHelper2'
import { Ref } from '@vue/composition-api'

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
  inject: ['objectSchemaHelper', 'displayLanguage'],
  async fetch() {
    this.objectTypes = await this.$api.schema.fetchAll()
  },
  computed: {
    headline(): string {
      if (this.dialog.mode === 'create') {
        return this.$t(`headlineCreate.${this.type}`) as string
      } else {
        return this.$t(`headlineEdit.${this.type}`, {
          title: this.item?.title ? `${this.item?.title}` : ''
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

        // Load the localized description for each attribute
        for (let attributeIndex in this.editedElement.attributes) {
          if(this.editedElement) {
            // @ts-ignore
            const objectSchemaHelper: Ref<ObjectSchemaHelper> = this.objectSchemaHelper
            // @ts-ignore
            const displayLanguage: Ref<string> = this.displayLanguage

            this.editedElement.attributes[attributeIndex].description = objectSchemaHelper.value.getTranslation(
              displayLanguage.value,
              `${this.editedElement.attributes[attributeIndex].prefix}${this.editedElement.attributes[attributeIndex].title}`
            ) || ''
          }
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

        // Load the localized description for each attribute
        for (let attributeIndex in newValue.attributes) {
          if(this.editedElement) {
            // @ts-ignore
            const objectSchemaHelper: Ref<ObjectSchemaHelper> = this.objectSchemaHelper
            // @ts-ignore
            const displayLanguage: Ref<string> = this.displayLanguage

            this.editedElement.attributes[attributeIndex].description = objectSchemaHelper.value.getTranslation(
              displayLanguage.value,
              `${newValue.attributes[attributeIndex].prefix}${newValue.attributes[attributeIndex].title}`
            ) || ''
          }
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
    "addAttribute": "Add attribute",
    "delete": {
      "aspect": "Delete aspect",
      "link": "Delete link"
    },
    "duplicateAttributes": "Attribute titles have to be unique in an aspect or link",
    "headlineCreate": {
      "aspect": "Create custom aspect",
      "link": "Create custom link"
    },
    "headlineEdit": {
      "aspect": "Edit aspect \"{title}\"",
      "link": "Edit custom link \"{title}\""
    },
    "noProperties": {
      "aspect": "This aspect has no attributes",
      "link": "This link has no attributes"
    },
    "linkDescription": "Description",
    "linkType": "Link type",
    "propertyName": "Name"
  },
  "de": {
    "addAttribute": "Attribut hinzufügen",
    "delete": {
      "aspect": "Aspekt löschen",
      "link": "Link löschen"
    },
    "duplicateAttributes": "Es kann immer nur ein Attribut mit den folgende(n) Titel(n) existieren",
    "headlineCreate": {
      "aspect": "Individuellen Aspekt erstellen",
      "link": "Individuellen Link erstellen"
    },
    "headlineEdit": {
      "aspect": "Aspekt \"{title}\" bearbeiten",
      "link": "Link \"{title}\" bearbeiten"
    },
    "linkDescription": "Linkbeschreibung",
    "linkNoProperties": "Dieser Link besitzt keine Attribute",
    "linkType": "Typ des Linkziels",
    "noProperties": {
      "aspect": "Dieser Aspekt besitzt keine Eigenschaften",
      "link": "Dieser Link besitzt keine Eigenschaften"
    },
    "propertyName": "Name"
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
