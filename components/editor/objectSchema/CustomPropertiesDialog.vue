<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BaseDialog
    :model-value="modelValue"
    :title="headline"
    large
    :confirm-close="isFormDirty"
    fixed-footer
    v-bind="$attrs"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <v-form
        ref="formRef"
        v-model="form.valid"
        @submit.prevent="onSubmit"
      >
        <h3 class="text-h3">
          {{ upperFirst(t('common').toString()) }}
        </h3>
        <BaseCard>
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="form.data.title"
                  :label="`${t('technicalId')} *`"
                  required
                  :rules="form.rules.title"
                  :prefix="prefix"
                  variant="underlined"
                />
              </v-col>
              <v-col
                v-if="type === 'link'"
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="form.data.translatedTitle"
                  :label="`${t('linkName')} *`"
                  required
                  :rules="[requiredRule]"
                  variant="underlined"
                />
              </v-col>
            </v-row>
            <v-row v-if="type === 'link'">
              <v-col
                cols="4"
                class="py-0"
              >
                <v-select
                  v-model="form.data.targetType"
                  :label="`${t('linkType')} *`"
                  :items="formattedObjectTypes"
                  required
                  :rules="form.rules.targetType"
                  variant="underlined"
                />
              </v-col>
              <v-col
                cols="4"
                class="py-0"
              >
                <v-select
                  v-model="form.data.subType"
                  :disabled="!form.data.targetType || form.data.targetType === ''"
                  :label="`${t('linkSubType')}`"
                  :items="filteredFormSchemas"
                  variant="underlined"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </BaseCard>
        <template v-if="dialogMode === 'edit'">
          <h3 class="text-h3 mt-6">
            {{ upperFirst(t('attributes').toString()) }} ({{ form.data.attributes.length }})
          </h3>
          <EditorObjectSchemaCustomAspectAttribute
            v-for="(attribute, index) of form.data.attributes"
            :key="index"
            v-bind="attribute"
            :aspect-name="aspectPrefix"
            @delete="removeAttribute(index)"
            @update="updateAttribute($event, index)"
          />
          <p
            v-if="form.data.attributes.length === 0"
            class="text-body-1 font-italic"
          >
            {{ t(`noProperties.${type}`) }}
          </p>
          <v-alert
            v-if="duplicates.length > 0"
            type="error"
            class="mb-4 mt-6"
            start
            colored-border
          >
            <span>{{ t('duplicateAttributes') }}:</span>
            <ul>
              <li
                v-for="duplicate of duplicates"
                :key="duplicate"
              >
                {{ duplicate }}
              </li>
            </ul>
          </v-alert>
          <v-btn
            variant="text"
            @click="addAttribute()"
          >
            <v-icon
              start
              :icon="mdiPlus"
            />
            {{ t('addAttribute') }}
          </v-btn>
        </template>
      </v-form>
      <small>{{ $t('global.input.requiredfields') }}</small>
    </template>
    <template #dialog-options>
      <v-btn
        v-if="propertyId"
        color="error"
        text
        @click="$emit('delete')"
      >
        {{ t(`delete.${type}`) }}
      </v-btn>
      <v-spacer />
      <template v-if="dialogMode === 'edit'">
        <v-btn
          text
          @click="close()"
        >
          {{ $t('global.button.close') }}
        </v-btn>
        <v-btn
          text
          color="primary"
          :disabled="form.valid === false || duplicates.length > 0 || !isFormDirty"
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
  </BaseDialog>
</template>
<script lang="ts">
import { cloneDeep, isEqual, trim, upperFirst } from 'lodash';
import { mdiPlus } from '@mdi/js';

import { IVeoSchemaEndpoints } from '~/composables/api/queryDefinitions/schemas';
import ObjectSchemaHelper, { IVeoOSHCustomAspect, IVeoOSHCustomLink, IVeoOSHCustomProperty } from '~/lib/ObjectSchemaHelper2';
import { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import { PropType } from 'vue';

import { useRules } from '~/composables/utils';

export default {
  props: {
    modelValue: {
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
    domainId: {
      type: String,
      required: true
    },
    objectTypes: {
      type: Object as PropType<IVeoSchemaEndpoints>,
      default: undefined
    },
    formSchemas: {
      type: Array as PropType<IVeoFormSchemaMeta[]>,
      default: () => []
    }
  },
  emits: ['delete', 'update:model-value', 'error', 'success'],
  setup(props) {
    const { t, locale } = useI18n();
    const { banSpecialChars, requiredRule } = useRules();

    const objectSchemaHelper: Ref<ObjectSchemaHelper | undefined> | undefined = inject('objectSchemaHelper');
    const displayLanguage = inject<Ref<string>>('displayLanguage', locale);

    const form = reactive({
      valid: false as boolean,
      data: {
        title: '',
        targetType: '',
        targetSubType: '',
        description: '',
        attributes: [],
        translatedTitle: undefined
      } as IVeoOSHCustomLink & { translatedTitle: string | undefined },
      rules: {
        title: [(input: string) => banSpecialChars(input), (input: string) => requiredRule(input)],
        description: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
        targetType: [(input: string) => props.type === 'aspect' || trim(input).length > 0]
      } as { [key: string]: ((input: string) => boolean)[] }
    });
    const pristineForm = ref(cloneDeep(form));

    const isFormDirty = computed(() => {
      return !isEqual(form.data, pristineForm.value.data);
    });

    const formRef = ref();
    watch(() => form, () => {
      // Validate to immideatly display error messages (needed for enum values)
      if(formRef.value) {
        nextTick(() => {
          formRef.value.validate();
        });
      }
    }, { deep: true, immediate: true });

    return {
      displayLanguage,
      form,
      isFormDirty,
      formRef,
      objectSchemaHelper,
      pristineForm,

      banSpecialChars,
      requiredRule,
      t
    };
  },
  data() {
    return {
      duplicates: [] as string[],
      dialogMode: 'create' as 'create' | 'edit',
      // Not computed, as changing the aspect/link title would make this undefined -> we want more control
      editedProperty: undefined as undefined | IVeoOSHCustomAspect | IVeoOSHCustomLink,
      mdiPlus
    };
  },
  computed: {
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
      return this.editedProperty?.prefix || `${this.objectSchemaHelper?.getTitle()}_` || '';
    },
    aspectPrefix(): string {
      return `${this.prefix}${this.form.data.title}`;
    },
    formattedObjectTypes(): { title: string; value: string }[] {
      return Object.keys(this.objectTypes || {}).map((schemaName) => ({
        title: upperFirst(schemaName),
        value: schemaName
      }));
    },
    filteredFormSchemas(): { title: string; value: string }[] {
      let schemas = this.formSchemas;
      if (this.form.data.targetType && this.form.data.targetType !== '') {
        schemas = schemas.filter((schema: IVeoFormSchemaMeta) => schema.modelType === this.form.data.targetType);
      }

      const schemasWithSubTypFormatted = schemas
        .map((schema: IVeoFormSchemaMeta) => ({
          title: schema.name[this.displayLanguage] || `Missing translation for ${this.displayLanguage.toUpperCase()}`,
          value: schema.subType
        }))
        .filter((schema) => schema.value !== null) as { title: string; value: string }[];

      schemasWithSubTypFormatted.unshift({ title: this.$t('no_subtype').toString(), value: '' });

      return schemasWithSubTypFormatted;
    }
  },
  watch: {
    modelValue(newValue: boolean) {
      if (!this.propertyId) {
        this.editedProperty = undefined;
      } else {
        this.editedProperty = cloneDeep(this.objectSchemaHelper?.getCustomAspect(this.propertyId) || this.objectSchemaHelper?.getCustomLink(this.propertyId));
      }

      if (!newValue) {
        this.form.data = {
          targetType: '',
          subType: '',
          title: '',
          attributes: [],
          translatedTitle: undefined
        };
        this.pristineForm = cloneDeep(this.form);
      } else if (this.editedProperty) {
        this.dialogMode = 'edit';
        // We have to explicitly set the properties missing in IVeoOSHCustomAspect
        this.form.data = {
          targetType: '',
          subType: '',
          translatedTitle: this.objectSchemaHelper?.getTranslation(this.displayLanguage, `${this.editedProperty.prefix}${this.editedProperty.title}`),
          ...cloneDeep(this.editedProperty)
        };

        for (const attributeIndex in this.form.data.attributes) {
          // Load the localized description for each attribute
          this.form.data.attributes[attributeIndex].description =
            this.objectSchemaHelper?.getTranslation(
              this.displayLanguage,
              `${this.form.data.attributes[attributeIndex].prefix}${this.form.data.attributes[attributeIndex].title}`
            ) || '';

          // Set the originalId property to later differentiate between new, deleted and renamed attributes
          this.form.data.attributes[attributeIndex].originalId = this.form.data.attributes[attributeIndex].title;
        }
        this.pristineForm = cloneDeep(this.form);
      } else {
        this.dialogMode = 'create';
      }
    }
  },
  methods: {
    upperFirst,
    close() {
      this.$emit('update:model-value', false);
    },
    onSubmit() {
      if (this.dialogMode === 'create') {
        this.dialogMode = 'edit';
      } else {
        this.saveProperty();
      }
    },
    saveProperty() {
      if(this.type === 'link' && !this.form.data.translatedTitle) {
        return;
      }
      try {
        if (!this.editedProperty) {
          if (this.type === 'aspect') {
            this.objectSchemaHelper?.addCustomAspect(this.form.data.title);

            // Set the prefix so that it won't be overwritten with undefined in the following updateCustomAspect
            const aspect = this.objectSchemaHelper?.getCustomAspect(this.form.data.title);
            this.form.data.prefix = aspect?.prefix;
          } else if (this.type === 'link') {
            this.objectSchemaHelper?.addCustomLink(this.form.data.title, this.form.data.targetType, this.form.data.subType);

            // Set the prefix so that it won't be overwritten with undefined in the following updateCustomLink
            const link = this.objectSchemaHelper?.getCustomLink(this.form.data.title);
            this.form.data.prefix = link?.prefix;

            const translation = `${this.form.data.prefix}${this.form.data.title}`;
            this.objectSchemaHelper?.addTranslation(translation, this.form.data.translatedTitle, this.displayLanguage);
          }
        } else if (this.type === 'aspect') {
          if (this.editedProperty.title !== this.form.data.title) {
            this.objectSchemaHelper?.renameCustomAspect(this.editedProperty.title, this.form.data.title);
            this.objectSchemaHelper?.changeTranslationKey(`${this.editedProperty.prefix}${this.editedProperty.title}`, `${this.editedProperty.prefix}${this.form.data.title}`);
          }
        } else {
          if (this.editedProperty.title !== this.form.data.title) {
            this.objectSchemaHelper?.renameCustomLink(this.editedProperty.title, this.form.data.title);
            this.objectSchemaHelper?.changeTranslationKey(`${this.editedProperty.prefix}${this.editedProperty.title}`, `${this.editedProperty.prefix}${this.form.data.title}`);
          }
          if(this.form.data.translatedTitle !== this.objectSchemaHelper?.getTranslation(this.displayLanguage,`${this.editedProperty.prefix}${this.form.data.title}`)) {
            this.objectSchemaHelper?.updateTranslation(this.displayLanguage, `${this.editedProperty.prefix}${this.form.data.title}`, this.form.data.translatedTitle);
          }
        }

        // Remove properties from attributes that shouldn't be saved and are only used here
        const toSave = cloneDeep(this.form.data);
        for (const attribute of toSave.attributes) {
          delete attribute.originalId;
          delete attribute.description;
        }

        if (this.type === 'aspect') {
          this.objectSchemaHelper?.updateCustomAspect(this.form.data.title, toSave);
        } else {
          this.objectSchemaHelper?.updateCustomLink(this.form.data.title, toSave);
        }

        // Update translations
        const attributePrefix = `${this.form.data.prefix}${this.form.data.title}_`;

        for (const attribute of this.form.data.attributes) {
          // Update translation key if attribute title changed across all languages
          if (attribute.originalId && attribute.originalId !== attribute.title) {
            this.objectSchemaHelper?.changeTranslationKey(`${attributePrefix}${attribute.originalId}`, `${attributePrefix}${attribute.title}`);
          }

          // If a description is set, save it for the current language
          if (attribute.description && attribute.description !== '') {
            this.objectSchemaHelper?.updateTranslation(this.displayLanguage, `${attributePrefix}${attribute.title}`, `${attribute.description}`);
          } else {
            // If no description is set, remove it if it exists (fail silent if not found)
            this.objectSchemaHelper?.removeTranslation(`${attributePrefix}${attribute.title}`, this.displayLanguage);
          }

          // Add a key for each enum entry
          if (attribute.type === 'enum' && attribute.enum) {
            for (const option of attribute.enum) {
              const translation = `${attributePrefix}${attribute.title}_${option}`;
              this.objectSchemaHelper?.addTranslation(translation, translation, this.displayLanguage);
            }
          }
        }

        // Remove language keys not present in the updated attribute lists
        if (this.editedProperty) {
          for (const attribute of this.editedProperty?.attributes || []) {
            if (!this.form.data.attributes.find((attribute2) => attribute2.originalId === attribute.title)) {
              this.objectSchemaHelper?.removeTranslation(`${attribute.prefix}${attribute.title}`);
            }

            // check for removed enum items to remove their translations
            if (attribute.type === 'enum') {
              const pastEnumItems = attribute.enum || [];
              const nowEnumItems = this.form.data.attributes.find((attribute2) => attribute2.originalId === attribute.title)?.enum || [];
              const removedEnumItems = pastEnumItems.filter((x) => !nowEnumItems.includes(x));
              for (const removedEnumItem of removedEnumItems) {
                this.objectSchemaHelper?.removeTranslation(`${attributePrefix}${attribute.title}_${removedEnumItem}`);
              }
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
};
</script>

<i18n>
{
  "en": {
    "attributes": "attributes",
    "addAttribute": "Add attribute",
    "common": "common",
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
    "linkName": "Link name",
    "linkSubType": "Link Subtype",
    "linkType": "Link type",
    "technicalId": "Technical id"
  },
  "de": {
    "attributes": "attribute",
    "addAttribute": "Attribut hinzufügen",
    "common": "allgemein",
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
    "noProperties": {
      "aspect": "Dieser Aspekt besitzt keine Attribute",
      "link": "Dieser Link besitzt keine Attribute"
    },
    "no_subtype": "Kein Subtyp",
    "linkName": "Linkname",
    "linkSubType": "Link Subtyp",
    "linkType": "Linktyp",
    "technicalId": "Technischer Bezeichner"
  }
}
</i18n>

