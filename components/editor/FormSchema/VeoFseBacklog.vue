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
  <div
    style="height: 100%"
  >
    <div
      v-show="!controlElementsVisible && searchQuery"
      class="text-center mt-1"
    >
      <span class="text--disabled">{{ t('searchNoMatch') }}</span>
    </div>
    <div
      v-show="controlElementsVisible"
      class="pt-4 text-center"
    >
      <v-btn
        text
        small
        @click="onExpandAll"
      >
        {{ t('expand') }}
      </v-btn>
      <v-btn
        text
        small
        @click="onCollapseAll"
      >
        {{ t('collapse') }}
      </v-btn>
    </div>
    <v-expansion-panels
      v-model="expansionPanels"
      accordion
      multiple
      flat
    >
      <v-expansion-panel v-show="filteredFormElements.length">
        <v-expansion-panel-header class="overline px-0">
          {{ t('formElements') }} ({{ filteredFormElements.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card
            outlined
            class="overflow-hidden"
          >
            <v-list
              dense
              class="py-0"
            >
              <Draggable
                class="drag-form-elements"
                tag="div"
                style="overflow: auto; min-width:300;"
                :list="filteredFormElements"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneFormElement"
              >
                <v-sheet
                  v-for="(el, i) in filteredFormElements"
                  :key="i"
                >
                  <VeoFseListItem
                    :title="el.description.title"
                    :styling="el.description"
                    translate
                  />
                </v-sheet>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-show="filteredBasics.length">
        <v-expansion-panel-header class="overline px-0">
          {{ t('editor.basicproperties') }} ({{ filteredBasics.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card
            v-show="filteredBasics.length"
            outlined
            class="overflow-hidden"
          >
            <v-list
              dense
              class="py-0"
            >
              <Draggable
                class="drag-unused-basic-properties"
                tag="div"
                style="overflow: auto; min-width:300;"
                :list="filteredBasics"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneControl"
              >
                <v-sheet
                  v-for="(el, i) in filteredBasics"
                  :key="i"
                >
                  <VeoFseListItem
                    :title="el.backlogTitle"
                    :styling="typeMap[el.type]"
                    translate
                  />
                </v-sheet>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-show="filteredAspects.length">
        <v-expansion-panel-header class="overline px-0">
          {{ t('editor.customaspects') }} ({{ filteredAspects.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card
            v-if="filteredAspects.length"
            outlined
            class="overflow-hidden"
          >
            <v-list
              dense
              class="py-0"
            >
              <Draggable
                class="drag-unused-aspects"
                tag="div"
                style="overflow: auto; min-width:300;"
                :list="filteredAspects"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneControl"
              >
                <v-sheet
                  v-for="(el, i) in filteredAspects"
                  :key="i"
                >
                  <VeoFseListItem
                    :title="el.backlogTitle"
                    :styling="typeMap[el.type]"
                    translate
                  />
                </v-sheet>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-show="filteredLinks.length">
        <v-expansion-panel-header class="overline px-0">
          {{ t('editor.customlinks') }} ({{ filteredLinks.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card
            v-if="filteredLinks.length"
            outlined
            class="overflow-hidden"
          >
            <v-list
              dense
              class="py-0"
            >
              <Draggable
                class="drag-unused-links"
                tag="div"
                style="overflow: auto; min-width:300;"
                :list="filteredLinks"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneControl"
              >
                <v-sheet
                  v-for="(el, i) in filteredLinks"
                  :key="i"
                >
                  <VeoFseListItem
                    :title="el.backlogTitle"
                    :styling="typeMap[el.type]"
                    translate
                  />
                </v-sheet>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel v-show="filteredWidgets.length">
        <v-expansion-panel-header class="overline px-0">
          {{ t('formWidgets') }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card
            v-if="filteredWidgets.length"
            outlined
            class="overflow-hidden"
          >
            <v-list
              dense
              class="py-0"
            >
              <Draggable
                class="drag-unused-widgets"
                tag="div"
                style="overflow: auto; min-width:300;"
                :list="filteredWidgets"
                :group="{ name: 'g1', pull: 'clone', put: false }"
                :sort="false"
                :clone="onCloneWidget"
              >
                <v-sheet
                  v-for="widget in filteredWidgets"
                  :key="widget.name"
                >
                  <VeoFseListItem
                    :title="widget.name"
                    :styling="{ icon: 'mdi-auto-fix', color: 'grey darken-4', name: upperFirst(t('widget').toString()) }"
                  />
                </v-sheet>
              </Draggable>
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, ref, Ref } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { JsonPointer } from 'json-ptr';
import Draggable from 'vuedraggable';
import { v4 as uuid } from 'uuid';
import { pick, upperFirst } from 'lodash';

import { INPUT_TYPES } from '~/types/VeoEditor';
import { IVeoFormSchema, IVeoObjectSchema } from '~/types/VeoTypes';
import { generateFormSchema, Mode } from '~/components/forms/util';
import { WIDGET_DEFINITION as PiaMandatoryWidgetDefinition } from '~/components/forms/widgets/VeoDPIAMandatoryWidget.vue';
import { IVeoFormsElementDefinition } from '~/components/forms/types';
import { IBaseObject } from '~/lib/utils';

interface IProps {
  searchQuery: string;
  formSchema: IVeoFormSchema;
  objectSchema: IVeoObjectSchema;
}

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

const WIDGETS = [PiaMandatoryWidgetDefinition];

export default defineComponent<IProps>({
  components: {
    Draggable
  },
  props: {
    searchQuery: {
      type: String,
      default: undefined
    },
    formSchema: {
      type: Object as PropType<IVeoFormSchema>,
      required: true
    },
    objectSchema: {
      type: Object as PropType<IVeoObjectSchema>,
      required: true
    }
  },
  setup(props, context) {
    const { t } = useI18n();

    const typeMap = ref(INPUT_TYPES);

    const formElements = [
      {
        type: 'Layout',
        options: {
          format: 'group'
        },
        elements: [],
        description: {
          title: 'group',
          icon: 'mdi-form-select',
          name: 'layout',
          color: 'grey darken-2'
        }
      },
      {
        type: 'Label',
        description: {
          title: 'text',
          icon: 'mdi-format-text',
          name: 'label',
          color: 'grey darken-2'
        }
      }
    ];

    const controls: Ref<IControl[]> = ref([]);

    // Nested Control items in a Control element, e.g. LinksField and its attributes
    const nestedControls: Ref<IControlItemMap> = ref({});

    // We want to group links but show each custom aspect attribute on their own, thus we use two different regex
    const objectSchemaPropertiesPatterns = {
      regexAspectsAttributes: /^#\/properties\/customAspects\/properties\/\w+\/properties\/attributes\/properties\/\w+$/,
      regexLinks: /^#\/properties\/links\/properties\/\w+/
    };

    // When ObjectSchema is loaded, controls and controlsItems should be initialized to use them in other functions
    function initializeControls() {
      const createControl = (key: string, value: IBaseObject, mode: Mode): IControl => {
        const propertyName = key.split('/').slice(-1)[0];
        const label = propertyName.split('_').pop() || '';
        let backlogTitle = propertyName;
        let category: IControl['category'] = 'basics';
        if (objectSchemaPropertiesPatterns.regexAspectsAttributes.test(key)) {
          category = 'aspects';
        } else if (objectSchemaPropertiesPatterns.regexLinks.test(key)) {
          category = 'links';
          const attributes = value.items?.properties?.attributes?.properties || [];

          for (const [attributeKey, attributeValue] of Object.entries<IBaseObject>(attributes)) {
            if (!nestedControls.value[key]) {
              nestedControls.value[key] = [];
            }
            nestedControls.value[key].push(createControl(`#/properties/attributes/properties/${attributeKey}`, attributeValue, mode));
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
            '(\\w+)/properties/domains$',
            '_self'
          ]
        },
        Mode.VEO
      );

      context.emit('controlItems', nestedControls.value);
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
    const expansionPanels: Ref<number[]> = ref([0, 1, 2, 3, 4]);

    function onExpandAll() {
      expansionPanels.value = [0, 1, 2, 3, 4];
    }

    function onCollapseAll() {
      expansionPanels.value = [];
    }

    const unused: ComputedRef<IUnused> = computed(() => {
      return {
        basics: controls.value.filter(
          (obj) => obj.category === 'basics' && !nonLayoutFormSchemaElements.value.find((element) => element.type === 'Control' && element.scope === obj.scope)
        ),
        aspects: controls.value.filter(
          (obj) => obj.category === 'aspects' && !nonLayoutFormSchemaElements.value.find((element) => element.type === 'Control' && element.scope === obj.scope)
        ),
        links: controls.value.filter(
          (obj) => obj.category === 'links' && !nonLayoutFormSchemaElements.value.find((element) => element.type === 'Control' && element.scope === obj.scope)
        ),
        widgets: WIDGETS.filter((widget) => !nonLayoutFormSchemaElements.value.find((element) => element.type === 'Widget' && element.name === widget.key))
      };
    });

    const filteredBasics: ComputedRef<IControl[]> = computed(() => {
      return unused.value.basics.filter((b: any) => !props.searchQuery || b.label?.toLowerCase().includes(props.searchQuery));
    });

    const filteredAspects: ComputedRef<IControl[]> = computed(() => {
      return unused.value.aspects.filter((a: any) => !props.searchQuery || a.label?.toLowerCase().includes(props.searchQuery));
    });

    const filteredLinks: ComputedRef<IControl[]> = computed(() => {
      return unused.value.links.filter((l: any) => !props.searchQuery || l.label?.toLowerCase().includes(props.searchQuery));
    });

    const filteredFormElements: ComputedRef<any> = computed(() => {
      return formElements.filter((f: any) => !props.searchQuery || f.description.title?.toLowerCase().includes(props.searchQuery));
    });

    const filteredWidgets = computed(() => unused.value.widgets.filter((widget) => !props.searchQuery || widget.key.toLowerCase().includes(props.searchQuery)));

    const controlElementsVisible: ComputedRef<Boolean> = computed(() => {
      return !!(filteredFormElements.value.length + filteredBasics.value.length + filteredAspects.value.length + filteredLinks.value.length);
    });

    /**
     * Interactive things (triggered by the user)
     */
    function onCloneFormElement(original: any) {
      // Return always new object reference on clone to get in issues of the same reference
      // https://github.com/SortableJS/Vue.Draggable/issues/203
      const element = JSON.parse(JSON.stringify(original));
      JsonPointer.unset(element, '#/description');
      if (element?.type?.toLowerCase() === 'label') {
        const elementName = `text_${uuid()}`;
        element.text = `#lang/${elementName}`;
      }
      return element;
    }
    function onCloneControl(original: IControl) {
      const dataToClone: IControl = JSON.parse(JSON.stringify(original));
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
      name: widget.name
    });

    return {
      filteredBasics,
      filteredAspects,
      filteredLinks,
      filteredFormElements,
      filteredWidgets,
      expansionPanels,
      controlElementsVisible,
      onExpandAll,
      onCollapseAll,
      onCloneFormElement,
      onCloneControl,
      onCloneWidget,
      typeMap,

      t,
      upperFirst
    };
  }
});
</script>

<style lang="scss" scoped>
.v-expansion-panel-content::v-deep .v-expansion-panel-content__wrap {
  padding: 0 0 16px !important;
}
</style>

<i18n>
{
  "en": {
    "collapse": "collapse all",
    "expand": "expand all",
    "formElements": "form elements",
    "formWidgets": "form widgets",
    "searchNoMatch": "no matching controls",
    "widget": "widget"
  },
  "de": {
    "collapse": "alle einklappen",
    "expand": "alle ausklappen",
    "formElements": "steuerelemente",
    "formWidgets": "Formular-Widgets",
    "searchNoMatch": "keine passenden Steuerelemente vorhanden",
    "widget": "Widget"
  }
}
</i18n>
