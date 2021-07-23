<template>
  <div
    class="px-2"
    style="height: 100%"
  >
    <v-card
      flat
      style="height: 100%"
    >
      <div
        v-show="!controlElementsVisible && searchQuery"
        class="text-center mt-1"
      >
        <span class="text--disabled">{{ $t('searchNoMatch') }}</span>
      </div>
      <div
        v-show="controlElementsVisible"
        class="px-4 py-4"
      >
        <v-btn
          text
          small
          @click="onExpandAll"
        >
          {{ $t('expand') }}
        </v-btn>
        <v-btn
          text
          small
          @click="onCollapseAll"
        >
          {{ $t('collapse') }}
        </v-btn>
      </div>
      <v-expansion-panels
        v-model="expansionPanels"
        accordion
        multiple
        flat
      >
        <v-expansion-panel v-show="filteredFormElements.length">
          <v-expansion-panel-header class="overline">
            {{ $t('formElements') }} ({{ filteredFormElements.length }})
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card outlined>
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
          <v-expansion-panel-header class="overline">
            {{ $t('editor.basicproperties') }} ({{ filteredBasics.length }})
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card
              v-show="filteredBasics.length"
              outlined
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
          <v-expansion-panel-header class="overline">
            {{ $t('editor.customaspects') }} ({{ filteredAspects.length }})
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card
              v-if="filteredAspects.length"
              outlined
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
          <v-expansion-panel-header class="overline">
            {{ $t('editor.customlinks') }} ({{ filteredLinks.length }})
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card
              v-if="filteredLinks.length"
              outlined
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
      </v-expansion-panels>
    </v-card>
  </div>
</template>
<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, ref, Ref, watch } from '@nuxtjs/composition-api';
import { JsonPointer } from 'json-ptr';
import vjp from 'vue-json-pointer';
import Draggable from 'vuedraggable';
import { v4 as uuid } from 'uuid';
import { INPUT_TYPES } from '~/types/VeoEditor';
import { IVeoFormSchema, IVeoObjectSchema } from '~/types/VeoTypes';

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
  used: boolean;
}

export interface IUnused {
  basics: IControl[];
  aspects: IControl[];
  links: IControl[];
}

export interface IControlItem {
  [key: string]: IControl[];
}

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
    const controlsItems: Ref<IControlItem> = ref({});
    /**
     * React to formschema or objectschema changes
     */
    const objectSchemaPropertiesPatterns = {
      standard: ['#/properties/name', '#/properties/abbreviation', '#/properties/description'],
      regexAspectsAttributes: /^#\/properties\/customAspects\/properties\/\w+\/properties\/attributes\/properties\/\w+$/,
      regexLinks: /^#\/properties\/links\/properties\/\w+$/,
      regexLinksAttributes: /^#\/properties\/links\/properties\/\w+\/items\/properties\/attributes\/properties\/\w+$/
    };

    // When ObjectSchema is loaded, controls and controlsItems should be initialized to use them in other functions
    function initializeControls() {
      const createControl = (key: string, value: any, category: IControl['category']): IControl => {
        const propertyName = key.split('/').slice(-1)[0];
        const label = propertyName.split('_').pop() || '';
        let backlogTitle = propertyName;

        if (category !== 'basics') {
          backlogTitle = backlogTitle.replace(`${props.formSchema.modelType}_`, '');
          backlogTitle = backlogTitle.replace('_', ' / ');
        }
        return {
          scope: key,
          type: Array.isArray(value.enum) ? 'enum' : value.type,
          label,
          backlogTitle,
          propertyName,
          category,
          used: false
        };
      };
      Object.entries(JsonPointer.flatten(props.objectSchema, true) as Record<string, any>).forEach(([key, value]) => {
        if (objectSchemaPropertiesPatterns.standard.includes(key)) {
          controls.value.push(createControl(key, value, 'basics'));
        } else if (objectSchemaPropertiesPatterns.regexAspectsAttributes.test(key)) {
          controls.value.push(createControl(key, value, 'aspects'));
        } else if (objectSchemaPropertiesPatterns.regexLinks.test(key)) {
          controls.value.push(createControl(key, value, 'links'));
        } else if (objectSchemaPropertiesPatterns.regexLinksAttributes.test(key)) {
          const [linksKey, linksAttribute] = key.split('/items/');
          if (!controlsItems.value[linksKey]) {
            controlsItems.value[linksKey] = [];
          }
          controlsItems.value[linksKey].push(createControl(`#/${linksAttribute}`, value, 'links'));
        }
      });

      context.emit('controlItems', controlsItems.value);
    }
    initializeControls();

    watch(
      () => props.formSchema.content,
      () => {
        const usedScopes = Object.entries(JsonPointer.flatten(props.formSchema.content, true))
          .filter(([key, _value]) => /elements\/\d+\/scope$/.test(key))
          .map(([_key, value]) => value as string);

        controls.value.forEach((obj, i) => {
          if (usedScopes.includes(obj.scope)) {
            // if an element is used in FormSchema and "used" property is not true yet => set to true
            if (obj.used === false) {
              vjp.set(controls.value, `/${i}/used`, true);
            }
          } else if (obj.used === true) {
            // if an element is not in FormSchema anymore, but "used" property is true => set to false
            vjp.set(controls.value, `/${i}/used`, false);
          }
        });
      },
      {
        deep: true,
        immediate: true
      }
    );

    /**
     * Computed refs that are displayed in the expansion panels.
     */
    const expansionPanels: Ref<number[]> = ref([0, 1, 2, 3]);

    function onExpandAll() {
      expansionPanels.value = [0, 1, 2, 3];
    }

    function onCollapseAll() {
      expansionPanels.value = [];
    }

    const unused: ComputedRef<IUnused> = computed(() => {
      return {
        basics: controls.value.filter((obj) => obj.category === 'basics' && !obj.used),
        aspects: controls.value.filter((obj) => obj.category === 'aspects' && !obj.used),
        links: controls.value.filter((obj) => obj.category === 'links' && !obj.used)
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

    return {
      filteredBasics,
      filteredAspects,
      filteredLinks,
      filteredFormElements,
      expansionPanels,
      controlElementsVisible,
      onExpandAll,
      onCollapseAll,
      onCloneFormElement,
      onCloneControl,
      controlsItems,
      typeMap
    };
  }
});
</script>

<i18n>
{
  "en": {
    "collapse": "collapse all",
    "expand": "expand all",
    "formElements": "form elements",
    "searchNoMatch": "no matching controls"
  },
  "de": {
    "collapse": "alle einklappen",
    "expand": "alle ausklappen",
    "formElements": "steuerelemente",
    "searchNoMatch": "keine passenden Steuerelemente vorhanden"
  }
}
</i18n>
