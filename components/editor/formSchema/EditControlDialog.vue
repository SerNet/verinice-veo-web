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
    :key="formSchema.scope"
    v-model="dialog.value"
    :headline="t('editControlHeadline')"
    large
    fixed-footer
  >
    <template #default>
      <h3 class="text-h3">
        {{ upperFirst(t('common').toString()) }}
      </h3>
      <BaseCard>
        <v-card-text>
          <v-form>
            <v-row
              no-gutters
              class="align-center mt-4"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;">{{ globalT('editor.formschema.edit.input.label.text') }}*:</span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-text-field
                  :model-value="localCustomTranslation[language][name] || defaultLabel"
                  :label="globalT('editor.formschema.edit.input.label')"
                  required
                  @update:model-value="onInputLabel"
                />
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="align-center"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;">{{ t('type') }}:</span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-select
                  v-model="activeControlType.name"
                  :label="t('typeInput')"
                  :disabled="alternatives.length === 1"
                  :append-icon="alternatives.length === 1 ? '' : undefined"
                  :items="alternatives"
                  item-title="name"
                  item-value="name"
                  @update:model-value="updateActiveControlType()"
                />
              </v-col>
            </v-row>
            <v-row
              v-if="activeControlType.name === 'LinksField'"
              no-gutters
              class="align-center"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;">{{ t('linkAttributes') }}:</span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-autocomplete
                  v-model="linksAttributes"
                  item-title="label"
                  :items="linksAttributesItems"
                  multiple
                  return-object
                  :label="t('linkAttributes')"
                  @update:model-value="onInputLinksAttributes"
                />
              </v-col>
            </v-row>
            <v-row
              v-if="activeControlType.name === 'Radio'"
              no-gutters
              class="align-center"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;">{{ globalT('editor.formschema.edit.input.direction') }}:</span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-autocomplete
                  v-model="activeControlType.direction"
                  :items="directionItems"
                  :label="globalT('editor.formschema.edit.input.direction')"
                />
              </v-col>
            </v-row>
            <EditorFormSchemaConditions
              v-model="activeControlType.rule"
              :current-scope="formSchema.scope"
            />
          </v-form>
          <small>{{ globalT('global.input.requiredfields') }}</small>
        </v-card-text>
      </BaseCard>
      <h3 class="text-h3 mt-6">
        {{ t('linkAttributes') }}
      </h3>
      <BaseCard v-if="activeControlType.name === 'LinksField' && formSchemaElements.length > 0">
        <Draggable
          v-model="formSchemaElements"
          class="dragArea d-flex flex-column fill-width fill-height"
          style="overflow: auto; min-height: 200px;"
          handle=".handle"
          :group="{ name: 'link-attributes' }"
          item-key="scope"
        >
          <template #item="{ element, index}">
            <EditorFormSchemaGeneratorElementsControl
              :name="element.scope.split('/').pop()"
              :object-schema="getSchema(element.scope)"
              :model-value="element"
              :options="element.options"
              :scope="element.scope"
              :form-schema="element"
              :form-schema-pointer="`${formSchemaPointer}/elements/${index}`"
              :general-translation="generalTranslation"
              :custom-translations="localCustomTranslation"
              :language="language"
              @update="onLinksAttributeUpdate(index, $event)"
              @delete="onLinksAttributeDelete(index, element.scope)"
              @update-custom-translation="onUpdateLinksCustomTranslation"
            />
          </template>
        </Draggable>
      </BaseCard>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="close()"
      >
        {{ globalT('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="updateElement()"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script lang="ts">
import Draggable from 'vuedraggable';
import { JsonPointer } from 'json-ptr';
import { cloneDeep, differenceBy, upperFirst } from 'lodash';
import { controlTypeAlternatives, IControlType } from '~/types/VeoEditor';
import { IVeoFormSchemaItem, IVeoFormSchemaItemUpdateEvent, IVeoFormSchemaTranslationCollection, IVeoTranslationCollection } from '~/types/VeoTypes';
import { deleteElementCustomTranslation } from '~/lib/FormSchemaHelper';
import { PropType } from 'vue';

export default defineComponent({
  components: {
    Draggable
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    schema: {
      type: Object,
      required: true
    },
    formSchema: {
      type: Object,
      required: true
    },
    formSchemaPointer: {
      type: String,
      default: ''
    },
    generalTranslation: {
      type: Object as PropType<IVeoTranslationCollection>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {}
    },
    customTranslations: {
      type: Object as PropType<IVeoFormSchemaTranslationCollection>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {}
    },
    type: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    }
  },
  emits: ['update:model-value', 'edit', 'update-custom-translation'],
  setup(props, context) {
    const { t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const { displayErrorMessage } = useVeoAlerts();

    // TODO: Refactor the component
    /**
     * General variables
     */

    const defaults: Record<string, any> = {
      direction: 'horizontal'
    };

    const localCustomTranslation = ref<IVeoFormSchemaTranslationCollection>({ ...props.customTranslations });

    /**
     * General functions
     */
    function getValue(pointer: string, defaultValue: any): any {
      const elValue = JsonPointer.get(props.formSchema, pointer);
      // Default values are not set mostly in FormSchema, therefore in this case return defaultValue, otherwise the real value
      return typeof elValue === 'undefined' || elValue === defaultValue ? defaultValue : elValue;
    }

    function transformValues(values: any): any {
      const transformedValues = JSON.parse(JSON.stringify(values));
      // name is only used for activeControlType but not in option, therefore it should be deleted before saving
      delete transformedValues.name;
      delete transformedValues.rule;
      Object.entries(values).forEach(([key, val]) => {
        if (key in defaults) {
          transformedValues[key] = val === defaults[key] ? undefined : val;
        }
      });
      return transformedValues;
    }

    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.modelValue });

    watch(
      () => props.modelValue,
      (val: boolean) => {
        dialog.value.value = val;
      }
    );

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('update:model-value', val);
        }
      }
    );

    function close() {
      context.emit('update:model-value', false);
    }

    /**
     * Control types related stuff
     */
    // TODO: this (also transformValues()) should be refactored and should like the structure as of FormSchema
    const activeControlType = ref<IControlType>({
      name: props.type,
      format: props.options.format,
      ...(props.type === 'Radio' && {
        direction: getValue('#/options/direction', defaults.direction)
      }),
      rule: getValue('#/rule', undefined)
    });

    watch(
      () => props.type,
      (val: string) => {
        activeControlType.value.name = val;
      }
    );

    const directionItems = ref([
      {
        title: globalT('editor.formschema.edit.input.direction.vertical'),
        value: 'vertical'
      },
      {
        title: globalT('editor.formschema.edit.input.direction.horizontal'),
        value: 'horizontal'
      }
    ]);

    function updateActiveControlType() {
      const newType = alternatives.value.find((item) => item.name === activeControlType.value.name);
      if (newType) {
        activeControlType.value = newType;
      } else {
        displayErrorMessage('Logic error', 'updateActiveControlType: Control type not found');
      }
    }

    /**
     * Label related code
     */

    function getDefaultLabel() {
      return props.generalTranslation?.[props.name] || props.name;
    }
    const defaultLabel = ref<string>(getDefaultLabel());

    function onInputLabel(event: string) {
      localCustomTranslation.value[props.language][props.name] = event;
    }

    const alternatives = computed(() => controlTypeAlternatives(activeControlType.value.name, props));

    /**
     * LinksField related code
     */

    const linksField: any = {};
    if (activeControlType.value.name === 'LinksField') {
      linksField.linksAttributesItems = ref((inject('controlsItems') as any).value[props.formSchema.scope]);
      // Important: JSON.parse(JSON.stringify()) is necessary to avoid edition of array objects through reference before saving
      linksField.formSchemaElements = ref(JSON.parse(JSON.stringify(props.formSchema.elements)));
      linksField.linksAttributes = ref(
        linksField.formSchemaElements.value.map((obj: any) => {
          return linksField.linksAttributesItems.value.find((attr: any) => attr.scope === obj.scope);
        })
      );

      // Provide linkScope and linksAttributes for VeoFseConditions to generate conditions for linksAttributes in a Dialog
      provide('linkScope', props.formSchema.scope);
      provide('linksAttributes', linksField.formSchemaElements);

      linksField.onInputLinksAttributes = function (event: any) {
        // Get attributes which were deleted in the autocomplete element (array, but always 1 element)
        const deletedLinksAttributes: IVeoFormSchemaItem[] = differenceBy<any>(linksField.formSchemaElements.value, event, 'scope');
        // Get attributes which were added in the autocomplete element (array, but always 1 element)
        const addedLinkAttributes: IVeoFormSchemaItem[] = differenceBy<any>(event, linksField.formSchemaElements.value, 'scope');
        // Scopes of Link Attributes which have not changed after update in autocomplete
        const currentLinkAttributesScopes: string[] = event.map((el: any) => el.scope);
        // Generate new FormSchema of Links Attributes by selecting the formSchema values of already existing attributes
        // and creating new formSchema values in autocomplete added new attributes
        linksField.formSchemaElements.value = [
          ...linksField.formSchemaElements.value.filter((el: any) => currentLinkAttributesScopes.includes(el.scope)),
          ...addedLinkAttributes.map((obj: any) => ({
            type: 'Control',
            scope: obj.scope,
            options: {
              label: `#lang/${obj.propertyName}`
            }
          }))
        ];

        // Remove translations for link Attributes which were removed
        deletedLinksAttributes.forEach((deletedElementFormSchema) => {
          deleteElementCustomTranslation(deletedElementFormSchema, localCustomTranslation.value, (updatedCustomTranslationValue) => {
            linksField.onUpdateLinksCustomTranslation(updatedCustomTranslationValue);
          });
        });
      };

      linksField.onLinksAttributeDelete = function (index: any, scope: string) {
        deleteElementCustomTranslation(linksField.formSchemaElements.value[index], localCustomTranslation.value, (updatedCustomTranslationValue) => {
          linksField.onUpdateLinksCustomTranslation(updatedCustomTranslationValue);
        });
        linksField.linksAttributes.value.splice(
          linksField.linksAttributes.value.findIndex((attr: any) => attr.scope === scope),
          1
        );
        linksField.formSchemaElements.value.splice(index, 1);
      };

      linksField.onLinksAttributeUpdate = function (index: number, payload: IVeoFormSchemaItemUpdateEvent) {
        linksField.formSchemaElements.value[index] = payload.data;
      };

      linksField.onUpdateLinksCustomTranslation = function (event: IVeoFormSchemaTranslationCollection) {
        localCustomTranslation.value = event;
      };

      linksField.getSchema = function (scope: string) {
        return JsonPointer.get(props.schema.items, scope);
      };
    }

    function updateElement() {
      const options: any = transformValues(activeControlType.value);
      let updateData: any = { ...props.formSchema, options: { label: props.formSchema?.options?.label, ...options } };
      if (activeControlType.value.name === 'LinksField') {
        updateData = { ...updateData, elements: linksField.formSchemaElements.value };
      }
      // Add rule at the end of the element data if the rule exists, otherwise remove it from the element data
      if (activeControlType.value.rule) {
        updateData = { ...updateData, rule: activeControlType.value.rule };
      } else {
        delete updateData.rule;
      }
      context.emit('edit', cloneDeep(updateData));
      context.emit('update-custom-translation', cloneDeep(localCustomTranslation.value));
    }

    return {
      dialog,
      localCustomTranslation,
      close,
      activeControlType,
      directionItems,
      defaultLabel,
      onInputLabel,
      alternatives,
      updateActiveControlType,
      updateElement,
      ...linksField,

      upperFirst,
      t,
      globalT
    };
  }
});
</script>

<i18n>
{
  "en": {
    "common": "common",
    "editControlHeadline": "Edit input element",
    "linkAttributes": "Link attributes",
    "type": "Control type",
    "typeInput": "Typ"
  },
  "de": {
    "common": "allgemein",
    "editControlHeadline": "Input Element anpassen",
    "linkAttributes": "Linkattribute",
    "type": "Steuerelement Typ",
    "typeInput": "Typ"

  }
}
</i18n>
