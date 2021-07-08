<template>
  <VeoDialog
    v-model="dialog"
    :headline="headline"
    large
    persistent
    fixed-header
  >
    <template #default>
      <v-form
        v-model="form.valid"
        @submit.prevent="onSubmit"
      >
        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <v-text-field
              v-model="form.data.title"
              :label="`${$t('propertyName')} *`"
              required
              :rules="form.rules.title"
              :prefix="prefix"
            />
          </v-col>
        </v-row>
        <v-row v-if="type === 'link'">
          <v-col
            cols="8"
            class="py-0"
          >
            <v-text-field
              v-model="form.data.description"
              :label="`${$t('linkDescription')} *`"
              required
              :rules="form.rules.description"
            />
          </v-col>
          <v-col
            cols="4"
            class="py-0"
          >
            <v-select
              v-model="form.data.targetType"
              :label="`${$t('linkType')} *`"
              :items="formattedObjectTypes"
              required
              :rules="form.rules.targetType"
            />
          </v-col>
          <v-col
            cols="4"
            class="py-0"
          >
            <v-select
              v-model="form.data.subType"
              :disabled="!form.data.targetType || form.data.targetType === ''"
              :label="`${$t('linkSubType')}`"
              :items="filteredFormSchemas"
            />
          </v-col>
        </v-row>
        <v-list
          v-if="dialogMode === 'edit'"
          dense
          class="py-0"
        >
          <template
            v-for="(attribute, index) of form.data.attributes"
            class="veo-attribute-list-attribute my-2"
          >
            <VeoOseCustomAspectAttribute
              v-bind="attribute"
              :key="index"
              :aspect-name="aspectPrefix"
              @delete="removeAttribute(index)"
              @update="updateAttribute($event, index)"
            />
          </template>

          <v-list-item v-if="form.data.attributes.length === 0">
            <v-list-item-content
              class="veo-attribute-list-no-content justify-center"
            >
              {{ $t(`noProperties.${type}`) }}
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="veo-attribute-list-add-button">
            <v-list-item-action>
              <v-spacer />
              <v-btn
                color="primary"
                text
                @click="addAttribute()"
              >
                <v-icon>mdi-plus-circle-outline</v-icon>
                <span class="ml-2">{{ $t('addAttribute') }}</span>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-alert
          v-if="duplicates.length > 0"
          type="error"
          class="mb-4 mt-6"
          border="left"
          colored-border
        >
          <span>{{ $t('duplicateAttributes') }}:</span>
          <ul>
            <li
              v-for="duplicate of duplicates"
              :key="duplicate"
            >
              {{ duplicate }}
            </li>
          </ul>
        </v-alert>
      </v-form>
      <small>{{ $t('global.input.requiredfields') }}</small>
    </template>
    <template #dialog-options>
      <v-btn
        v-if="propertyId"
        color="primary"
        outlined
        @click="$emit('delete')"
      >
        {{ $t(`delete.${type}`) }}
      </v-btn>
      <v-spacer />
      <template v-if="dialogMode === 'edit'">
        <v-btn
          text
          color="primary"
          @click="close()"
        >
          {{ $t('global.button.close') }}
        </v-btn>
        <v-btn
          text
          color="primary"
          :disabled="!form.valid || duplicates.length > 0"
          @click="saveProperty()"
        >
          {{ $t('global.button.save') }}
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          text
          color="primary"
          :disabled="!form.valid"
          @click="dialogMode = 'edit'"
        >
          {{ $t('global.button.next') }}
        </v-btn>
      </template>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { capitalize, cloneDeep, trim } from 'lodash';

import { Ref } from '@nuxtjs/composition-api';
import { ISchemaEndpoint } from '~/plugins/api/schema';
import ObjectSchemaHelper, { IVeoOSHCustomAspect, IVeoOSHCustomLink, IVeoOSHCustomProperty } from '~/lib/ObjectSchemaHelper2';
import { IVeoFormSchemaMeta } from '~/types/VeoTypes';

export default Vue.extend({
  inject: ['objectSchemaHelper', 'displayLanguage'],
  props: {
    value: {
      type: Boolean,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    propertyId: {
      type: String,
      default: undefined
    },
    // Doesn't actually get passed as a prop but injected by DI. However Typescript can't handle that so we define it here.
    // The default value gets overwritte by DI
    // See: https://github.com/vuejs/vue/issues/8969
    objectSchemaHelper: {
      type: Object as Prop<Ref<ObjectSchemaHelper>>,
      default: undefined
    },
    // Doesn't actually get passed as a prop but injected by DI. However Typescript can't handle that so we define it here.
    // The default value gets overwritte by DI
    // See: https://github.com/vuejs/vue/issues/8969
    displayLanguage: {
      type: Object as Prop<Ref<string>>,
      default: undefined
    }
  },
  data() {
    return {
      form: {
        valid: false as boolean,
        data: {
          title: '',
          targetType: '',
          targetSubType: '',
          description: '',
          attributes: []
        } as IVeoOSHCustomLink,
        rules: {
          title: [(input: string) => trim(input).length > 0],
          description: [(input: string) => this.type === 'aspect' || trim(input).length > 0],
          targetType: [(input: string) => this.type === 'aspect' || trim(input).length > 0]
        } as { [key: string]: ((input: string) => boolean)[] }
      },
      objectTypes: [] as ISchemaEndpoint[],
      formSchemas: [] as IVeoFormSchemaMeta[],
      duplicates: [] as string[],
      dialogMode: 'create' as 'create' | 'edit',
      // Not computed, as changing the aspect/link title would make this undefined -> we want more control
      editedProperty: undefined as undefined | IVeoOSHCustomAspect | IVeoOSHCustomLink
    };
  },
  async fetch() {
    this.objectTypes = await this.$api.schema.fetchAll();
    this.formSchemas = await this.$api.form.fetchGlobal();
  },
  computed: {
    dialog: {
      get(): boolean {
        return this.value;
      },
      set(newValue: boolean) {
        this.$emit('input', newValue);
      }
    },
    headline(): string {
      if (!this.editedProperty) {
        return this.$t(`headlineCreate.${this.type}`) as string;
      } else {
        return this.$t(`headlineEdit.${this.type}`, {
          title: this.editedProperty.title ?? ''
        }) as string;
      }
    },
    prefix(): string {
      return this.editedProperty?.prefix || `${this.objectSchemaHelper.value.getTitle()}_` || '';
    },
    aspectPrefix(): string {
      return `${this.prefix}${this.form.data.title}`;
    },
    formattedObjectTypes(): { text: string; value: string }[] {
      return this.objectTypes.map((value: ISchemaEndpoint) => ({
        text: capitalize(value.schemaName),
        value: value.schemaName
      }));
    },
    filteredFormSchemas(): { text: string; value: string }[] {
      let schemas = this.formSchemas;
      if (this.form.data.targetType && this.form.data.targetType !== '') {
        schemas = schemas.filter((schema: IVeoFormSchemaMeta) => schema.modelType === this.form.data.targetType);
      }

      const schemasWithSubTypFormatted = schemas
        .map((schema: IVeoFormSchemaMeta) => ({
          text: schema.name[this.displayLanguage.value] || `Missing translation for ${this.displayLanguage.value.toUpperCase()}`,
          value: schema.subType
        }))
        .filter((schema) => schema.value !== null) as { text: string; value: string }[];

      schemasWithSubTypFormatted.unshift({ text: this.$t('no_subtype').toString(), value: '' });

      return schemasWithSubTypFormatted;
    }
  },
  watch: {
    value(newValue: boolean) {
      if (!this.propertyId) {
        this.editedProperty = undefined;
      } else {
        this.editedProperty = cloneDeep(this.objectSchemaHelper.value.getCustomAspect(this.propertyId) || this.objectSchemaHelper.value.getCustomLink(this.propertyId));
      }

      if (!newValue) {
        this.form.data.description = '';
        this.form.data.targetType = '';
        this.form.data.subType = '';
        this.form.data.title = '';
        this.form.data.attributes = [];
      } else if (this.editedProperty) {
        this.dialogMode = 'edit';
        // We have to explicitly set the properties missing in IVeoOSHCustomAspect
        this.form.data = { description: '', targetType: '', subType: '', ...cloneDeep(this.editedProperty) };

        // Load the translated link description if it is a link (Only if not set. Will only be set on old schemas as fallback)
        if (this.type === 'link' && !this.form.data.description) {
          this.form.data.description = this.objectSchemaHelper.value.getTranslation(this.displayLanguage.value, `${this.form.data.prefix}${this.form.data.title}`);
        }

        for (const attributeIndex in this.form.data.attributes) {
          // Load the localized description for each attribute
          this.form.data.attributes[attributeIndex].description =
            this.objectSchemaHelper.value.getTranslation(
              this.displayLanguage.value,
              `${this.form.data.attributes[attributeIndex].prefix}${this.form.data.attributes[attributeIndex].title}`
            ) || '';

          // Set the originalId property to later differentiate between new, deleted and renamed attributes
          this.form.data.attributes[attributeIndex].originalId = this.form.data.attributes[attributeIndex].title;
        }
      } else {
        this.dialogMode = 'create';
      }
    }
  },
  methods: {
    close() {
      this.$emit('input', false);
    },
    onSubmit() {
      if (this.dialogMode === 'create') {
        this.dialogMode = 'edit';
      } else {
        this.saveProperty();
      }
    },
    saveProperty() {
      try {
        if (!this.editedProperty) {
          if (this.type === 'aspect') {
            this.objectSchemaHelper.value.addCustomAspect(this.form.data.title);

            // Set the prefix so that it won't be overwritten with undefined in the following updateCustomAspect
            const aspect = this.objectSchemaHelper.value.getCustomAspect(this.form.data.title);
            this.form.data.prefix = aspect?.prefix;
          } else {
            this.objectSchemaHelper.value.addCustomLink(this.form.data.title, this.form.data.targetType, this.form.data.subType);

            // Set the prefix so that it won't be overwritten with undefined in the following updateCustomLink
            const link = this.objectSchemaHelper.value.getCustomLink(this.form.data.title);
            this.form.data.prefix = link?.prefix;
          }
        } else if (this.type === 'aspect') {
          if (this.editedProperty.title !== this.form.data.title) {
            this.objectSchemaHelper.value.renameCustomAspect(this.editedProperty.title, this.form.data.title);
          }
        } else if (this.editedProperty.title !== this.form.data.title) {
          this.objectSchemaHelper.value.renameCustomLink(this.editedProperty.title, this.form.data.title);
        }

        // Remove properties from attributes that shouldn't be saved and are only used here
        const toSave = cloneDeep(this.form.data);
        for (const attribute of toSave.attributes) {
          delete attribute.originalId;
          delete attribute.description;
        }

        if (this.type === 'aspect') {
          this.objectSchemaHelper.value.updateCustomAspect(this.form.data.title, toSave);
        } else {
          delete toSave.description;
          this.objectSchemaHelper.value.updateCustomLink(this.form.data.title, toSave);
        }

        // Update translations
        const attributePrefix = `${this.form.data.prefix}${this.form.data.title}_`;

        if (this.type === 'link') {
          if (!this.editedProperty) {
            this.objectSchemaHelper.value.addTranslation(`${this.form.data.prefix}${this.form.data.title}`, this.form.data.description || '', this.displayLanguage.value);
          } else if (this.editedProperty && this.editedProperty.title !== this.form.data.title) {
            this.objectSchemaHelper.value.changeTranslationKey(`${this.editedProperty.prefix}${this.editedProperty.title}`, `${this.form.data.prefix}${this.form.data.title}`);
          }

          if (this.editedProperty) {
            if (this.form.data.description && this.form.data.description !== '') {
              this.objectSchemaHelper.value.updateTranslation(this.displayLanguage.value, `${this.form.data.prefix}${this.form.data.title}`, this.form.data.description);
            } else {
              this.objectSchemaHelper.value.removeTranslation(`${this.form.data.prefix}${this.form.data.title}`, this.displayLanguage.value);
            }
          }
        }

        for (const attribute of this.form.data.attributes) {
          // Update translation key if aspect/link title changed across all languages
          if (attribute.originalId && this.editedProperty && this.editedProperty.title !== this.form.data.title) {
            this.objectSchemaHelper.value.changeTranslationKey(
              `${this.editedProperty.prefix}${this.editedProperty.title}_${attribute.originalId}`,
              `${attributePrefix}${attribute.originalId}`
            );
          }

          // Update translation key if attribute title changed across all languages
          if (attribute.originalId && attribute.originalId !== attribute.title) {
            this.objectSchemaHelper.value.changeTranslationKey(`${attributePrefix}${attribute.originalId}`, `${attributePrefix}${attribute.title}`);
          }

          // If a description is set, save it for the current language
          if (attribute.description && attribute.description !== '') {
            this.objectSchemaHelper.value.updateTranslation(this.displayLanguage.value, `${attributePrefix}${attribute.title}`, `${attribute.description}`);
          } else {
            // If no description is set, remove it if it exists (fail silent if not found)
            this.objectSchemaHelper.value.removeTranslation(`${attributePrefix}${attribute.title}`, this.displayLanguage.value);
          }

          // Add a key for each enum entry
          if (attribute.type === 'enum' && attribute.enum) {
            for (const option of attribute.enum) {
              this.objectSchemaHelper.value.addTranslation(option, option, this.displayLanguage.value);
            }
          }
        }

        // Remove language keys not present in the updated attribute lists
        if (this.editedProperty) {
          for (const attribute of this.editedProperty?.attributes) {
            if (!this.form.data.attributes.find((attribute2) => attribute2.originalId === attribute.title)) {
              this.objectSchemaHelper.value.removeTranslation(`${attribute.prefix}${attribute.title}`);
            }
          }
        }

        this.$emit('success');
      } catch (e) {
        this.$emit('error', e);
      }
    },
    addAttribute() {
      this.form.data.attributes.push({
        type: 'string',
        title: '',
        description: ''
      });
    },
    removeAttribute(index: number) {
      this.form.data?.attributes.splice(index, 1);
    },
    updateAttribute(newValues: IVeoOSHCustomProperty, index: number) {
      this.form.data.attributes[index] = newValues;

      this.checkForDuplicate();
    },
    checkForDuplicate() {
      this.duplicates = [];

      for (const attribute1 of this.form.data.attributes) {
        if (this.form.data.attributes.filter((attribute2: IVeoOSHCustomProperty) => attribute2.title.toLowerCase() === attribute1.title.toLowerCase()).length > 1) {
          const duplicateTitle = attribute1.title.toLowerCase();
          if (!this.duplicates.includes(duplicateTitle)) {
            this.duplicates.push(duplicateTitle);
          }
        }
      }
    }
  }
});
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
    "no_subtype": "No subtype",
    "linkDescription": "Description",
    "linkSubType": "Link Subtype",
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
    "linkSubType": "Link Subtyp",
    "linkType": "Typ des Linkziels",
    "noProperties": {
      "aspect": "Dieser Aspekt besitzt keine Eigenschaften",
      "link": "Dieser Link besitzt keine Eigenschaften"
    },
    "no_subtype": "Kein spezieller Subtyp",
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
