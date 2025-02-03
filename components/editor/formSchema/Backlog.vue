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
  <div style="height: 100%">
    <div v-show="!controlElementsVisible && searchQuery" class="text-center mt-1">
      <span class="text--disabled">{{ t('searchNoMatch') }}</span>
    </div>
    <div v-show="controlElementsVisible" class="ma-4 text-center">
      <v-btn class="mx-1" variant="elevated" size="small" @click="onExpandAll">
        {{ t('expand') }}
      </v-btn>
      <v-btn class="mx-1" variant="elevated" size="small" @click="onCollapseAll">
        {{ t('collapse') }}
      </v-btn>
    </div>
    <v-expansion-panels v-model="expansionPanels" accordion multiple flat>
      <v-expansion-panel v-show="filteredFormElements.length">
        <v-expansion-panel-title class="text-h5 overline small-caps px-2">
          {{ t('formElements') }} ({{ filteredFormElements.length }})
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card variant="outlined" class="overflow-hidden">
            <v-list class="py-0">
              <Draggable
                :list="filteredFormElements"
                class="drag-form-elements"
                style="overflow: auto; min-width: 300"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneFormElement"
                :item-key="(element: any) => element.description.title"
              >
                <template #item="{ element }">
                  <EditorListItem
                    :scope="element.scope"
                    :title="upperFirst(element.description.title)"
                    :styling="element.description"
                    translate
                  />
                </template>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel v-show="filteredBasics.length">
        <v-expansion-panel-title class="text-h5 overline small-caps px-2">
          {{ globalT('editor.basicproperties') }} ({{ filteredBasics.length }})
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card v-show="filteredBasics.length" variant="outlined" class="overflow-hidden">
            <v-list class="py-0">
              <Draggable
                v-model="filteredBasics"
                class="drag-unused-basic-properties"
                tag="div"
                style="overflow: auto; min-width: 300"
                item-key="scope"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneControl"
              >
                <template #item="{ element }">
                  <EditorListItem
                    :scope="element.scope"
                    :title="t(`${element.propertyName}`)"
                    :styling="typeMap[element.type]"
                    translate
                  />
                </template>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel v-show="filteredAspects.length">
        <v-expansion-panel-title class="text-h5 overline small-caps px-2">
          {{ globalT('editor.customaspects') }} ({{ filteredAspects.length }})
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card v-if="filteredAspects.length" variant="outlined" class="overflow-hidden">
            <v-list class="py-0">
              <Draggable
                :list="filteredAspects"
                class="drag-unused-aspects"
                tag="div"
                style="overflow: auto; min-width: 300"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneControl"
                item-key="scope"
              >
                <template #item="{ element }">
                  <EditorListItem
                    :scope="element.scope"
                    :title="element.backlogTitle"
                    :styling="typeMap[element.type]"
                    translate
                  />
                </template>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel v-show="filteredLinks.length">
        <v-expansion-panel-title class="text-h5 overline small-caps px-2">
          {{ globalT('editor.customlinks') }} ({{ filteredLinks.length }})
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card v-if="filteredLinks.length" variant="outlined" class="overflow-hidden">
            <v-list class="py-0">
              <Draggable
                :list="filteredLinks"
                class="drag-unused-links"
                style="overflow: auto; min-width: 300"
                item-key="scope"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneControl"
              >
                <template #item="{ element }">
                  <EditorListItem
                    :scope="element.scope"
                    :title="element.backlogTitle"
                    :styling="typeMap[element.type]"
                    translate
                  />
                </template>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel v-show="filteredWidgets.length">
        <v-expansion-panel-title class="overline px-0">
          {{ t('formWidgets') }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card v-if="filteredWidgets.length" variant="outlined" class="overflow-hidden">
            <v-list class="py-0">
              <Draggable
                :list="filteredWidgets"
                item-key="code"
                class="drag-unused-widgets"
                style="overflow: auto; min-width: 300"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneWidget"
              >
                <template #item="{ element }">
                  <EditorListItem
                    :scope="element.scope"
                    :title="element.name[locale] || Object.values(element.name)[0]"
                    :styling="{
                      icon: mdiAutoFix,
                      color: 'grey darken-4',
                      name: upperFirst(t('widget').toString())
                    }"
                  />
                </template>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { JsonPointer } from 'json-ptr';
import { cloneDeep, pick, upperFirst } from 'lodash';
import { v4 as uuid } from 'uuid';
import { mdiAutoFix, mdiFormatText, mdiFormSelect, mdiArrowCollapseVertical } from '@mdi/js';

import Draggable from 'vuedraggable';

import type { IVeoFormsElementDefinition } from '~/components/dynamic-form/types';
import { generateFormSchema, Mode } from '~/components/dynamic-form/util';
import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import { IVeoFormSchema } from '~/composables/api/queryDefinitions/forms';
import { INPUT_TYPES } from '~/types/VeoEditor';
import type { IVeoDomainSpecificObjectSchema, IVeoRiskCategory } from '~/types/VeoTypes';

export interface IControl {
  scope: string;
  // TODO: These types are assumed for us to describe easily property type, however e.g. "type: enum" does not exist in JSONSchema standard
  // Therefore, "type: enum", describes the JSONSchema element, which includes "enum: []"
  type: 'string' | 'boolean' | 'object' | 'number' | 'integer' | 'array' | 'enum' | 'null' | 'default';
  label: string;
  backlogTitle: string;
  propertyName: string;
  category: 'basics' | 'aspects' | 'links';
}

export interface IUnused {
  basics: IControl[];
  aspects: IControl[];
  links: IControl[];
  widgets: IVeoFormsElementDefinition[];
}

export interface IControlItemMap {
  [parent: string]: IControl[];
}

const WIDGETS: IVeoFormsElementDefinition[] = [];

const props = defineProps<{
  domain: IVeoDomain,
  formSchema: IVeoFormSchema;
  objectSchema: IVeoDomainSpecificObjectSchema;
  searchQuery?: string;
}>();

const emit = defineEmits<{
  (event: 'control-items', value: any): void;
}>();

const { locale, t } = useI18n();
const { t: globalT, locales } = useI18n({ useScope: 'global' });

    const typeMap = ref(INPUT_TYPES);

    const getTranslations = (category: IVeoRiskCategory) => {
      return locales.value.reduce(
        (acc, locale) => {
          acc[locale.code] = category.translations[locale.code]?.name || Object.values(category.translations)[0].name;
          return acc;
        },
        {} as Record<string, string>
      );
    };

    const formElements = [
      {
        type: 'Layout',
        options: {
          format: 'impactGroup'
        },
        elements: [],
        description: {
          title: 'impacts',
          icon: mdiFormSelect,
          name: 'composite',
          color: 'purple darken-2'
        }
      },
      {
        type: 'Layout',
        options: {
          format: 'group'
        },
        elements: [],
        description: {
          title: 'group',
          icon: mdiFormSelect,
          name: 'layout',
          color: 'grey darken-2'
        }
      },
      {
        type: 'Layout',
        options: {
          format: 'accordion'
        },
        elements: [],
        description: {
          title: 'accordion',
          icon: mdiArrowCollapseVertical,
          name: 'layout',
          color: 'grey darken-2'
        }
      },
      {
        type: 'Label',
        description: {
          title: 'text',
          icon: mdiFormatText,
          name: 'label',
          color: 'grey darken-2'
        }
      }
    ];

const controls = ref<IControl[]>([]);

// Nested Control items in a Control element, e.g. LinksField and its attributes
const nestedControls = ref<IControlItemMap>({});

// We want to group links but show each custom aspect attribute on their own, thus we use two different regex
const objectSchemaPropertiesPatterns = {
  regexAspectsAttributes: /^#\/properties\/customAspects\/properties\/\w+\/properties\/\w+$/,
  regexLinks: /^#\/properties\/links\/properties\/\w+/
};

// When ObjectSchema is loaded, controls and controlsItems should be initialized to use them in other functions
function initializeControls() {
  const createControl = (key: string, value: Record<string, any>, mode: Mode): IControl => {
    const propertyName = key.split('/').slice(-1)[0];
    const label = propertyName.split('_').pop() || '';
    let backlogTitle = propertyName;
    let category: IControl['category'] = 'basics';
    if (objectSchemaPropertiesPatterns.regexAspectsAttributes.test(key)) {
      category = 'aspects';
    } else if (objectSchemaPropertiesPatterns.regexLinks.test(key)) {
      category = 'links';
      const attributes = value.items?.properties?.attributes?.properties || [];

      for (const [attributeKey, attributeValue] of Object.entries<Record<string, any>>(attributes)) {
        if (!nestedControls.value[key]) {
          nestedControls.value[key] = [];
        }
        nestedControls.value[key].push(
          createControl(`#/properties/attributes/properties/${attributeKey}`, attributeValue, mode)
        );
      }
    }

    if (category !== 'basics') {
      backlogTitle = backlogTitle.replace(`${props.formSchema.modelType}_`, '');
      backlogTitle = backlogTitle.replace('_', ' / ');
    }
    return {
      scope: decodeURIComponent(key), // We use decodeURIComponent, as JSONPointer.flatten() encodes keys, turning {CURRENT_DOMAIN_ID} into %7BCURRENT_DOMAIN_ID%7D
      type: Array.isArray(value.enum) ? 'enum' : value.type,
      label,
      backlogTitle,
      propertyName,
      category
    };
  };

  controls.value = generateFormSchema(
    props.objectSchema,
    {
      generateControlFunction: createControl,
      generateGroupFunction: (children) => children,
      excludedProperties: [
        '/id$',
        '/type$',
        '/owner$',
        '/updatedAt$',
        '/updatedBy$',
        '/createdAt$',
        '/createdBy$',
        '/parts$',
        '/members$',
        '/designator$',
        '_self',
        '/risks$',
        '/decisionResults$'
      ]
    },
    Mode.VEO
  );

  emit('control-items', nestedControls.value as any);
}
initializeControls();

const nonLayoutFormSchemaElements = computed<{ type: string; name?: string; scope?: string }[]>(
  () =>
    Object.values(JsonPointer.flatten(props.formSchema.content, true))
      .filter((element: any) => typeof element === 'object' && element.type && element.type !== 'Layout')
      .map((element: any) => pick(element, 'type', 'scope', 'name')) as any
);

/**
 * Computed refs that are displayed in the expansion panels.
 */
const expansionPanels = ref<number[]>([0, 1, 2, 3, 4]);

function onExpandAll() {
  expansionPanels.value = [0, 1, 2, 3, 4];
}

function onCollapseAll() {
  expansionPanels.value = [];
}

const unused = computed<IUnused>(() => {
  return {
    basics: controls.value.filter(
      (obj) =>
        obj.category === 'basics' &&
        !nonLayoutFormSchemaElements.value.find((element) => element.type === 'Control' && element.scope === obj.scope)
    ),
    aspects: controls.value.filter(
      (obj) =>
        obj.category === 'aspects' &&
        !nonLayoutFormSchemaElements.value.find((element) => element.type === 'Control' && element.scope === obj.scope)
    ),
    links: controls.value.filter(
      (obj) =>
        obj.category === 'links' &&
        !nonLayoutFormSchemaElements.value.find((element) => element.type === 'Control' && element.scope === obj.scope)
    ),
    widgets: WIDGETS.filter(
      (widget) =>
        !nonLayoutFormSchemaElements.value.find((element) => element.type === 'Widget' && element.name === widget.code)
    )
  };
});

const filteredBasics = computed<IControl[]>(() => {
  return unused.value.basics.filter(
    (b: any) => !props.searchQuery || b.label?.toLowerCase().includes(props.searchQuery)
  );
});

const filteredAspects = computed<IControl[]>(() => {
  return unused.value.aspects.filter(
    (a: any) => !props.searchQuery || a.label?.toLowerCase().includes(props.searchQuery)
  );
});

const filteredLinks = computed<IControl[]>(() => {
  return unused.value.links.filter(
    (l: any) => !props.searchQuery || l.label?.toLowerCase().includes(props.searchQuery)
  );
});

const filteredFormElements = computed<any>(() => {
  return formElements.filter(
    (f: any) => !props.searchQuery || f.description.title?.toLowerCase().includes(props.searchQuery)
  );
});

const filteredWidgets = computed(() =>
  unused.value.widgets.filter((widget) => !props.searchQuery || widget.code.toLowerCase().includes(props.searchQuery))
);

const controlElementsVisible = computed<boolean>(() => {
  return !!(
    filteredFormElements.value.length +
    filteredBasics.value.length +
    filteredAspects.value.length +
    filteredLinks.value.length
  );
});

    /**
     * Interactive things (triggered by the user)
     */
    function onCloneFormElement(original: any) {
      const element = cloneDeep(original);

      if (element?.options?.format !== 'impactGroup') {
        JsonPointer.unset(element, '#/description');
      }

      if (element?.type?.toLowerCase() === 'label') {
        element.text = `#lang/text_${uuid()}`;
      }

      if (element?.description?.title === 'impacts') {
        element.options ??= {};
        element.options.format = 'impactGroup';
      }

      return element;
    }

    function onCloneControl(original: IControl) {
      const dataToClone: IControl = cloneDeep(original);
      return {
        type: 'Control',
        scope: dataToClone.scope,
        options: {
          label: `#lang/${dataToClone.propertyName}`
        },
        ...(dataToClone.category === 'links' && { elements: [] })
      };
    }

const onCloneWidget = (widget: IVeoFormsElementDefinition) => ({
  type: 'Widget',
  name: widget.name[locale.value] || Object.values(widget.name)[0]
});
</script>

<i18n src="~/locales/base/components/editor-form-schema-backlog.json"></i18n>

<style lang="scss" scoped>
.v-expansion-panel-text:deep(.v-expansion-panel-text__wrap) {
  padding: 0 0 16px !important;
}
</style>
