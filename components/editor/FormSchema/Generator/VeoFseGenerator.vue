<!--
   - verinice.veo web
   - Copyright (C) 2021 Davit Svandize, Jonas Heitmann
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
<script lang="ts">
import Vue, { VNode, PropOptions } from 'vue';
import { JSONSchema7 } from 'json-schema';
import { JsonPointer } from 'json-ptr';

import FseLabel from './elements/VeoFseLabel.vue';
import FseControl from './elements/VeoFseControl.vue';
import FseLayout from './elements/VeoFseLayout.vue';
import VeoFseWidget from './elements/VeoFseWidget.vue';
import { UISchema, UISchemaElement } from '~/types/UISchema';
import { IVeoFormSchemaTranslationCollection, IVeoTranslationCollection } from '~/types/VeoTypes';
import { IVeoFormsElementDefinition } from '~/components/forms/types';

const WIDGETS: IVeoFormsElementDefinition[] = [];

export default Vue.extend({
  name: 'FseGenerator',
  props: {
    schema: {
      type: Object,
      required: true
    } as PropOptions<JSONSchema7>,
    value: {
      type: Object,
      default: undefined
    } as PropOptions<UISchema>,
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    customTranslations: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollection>,
    language: {
      type: String,
      required: true
    }
  },
  render(h): VNode {
    const createComponent = (element: UISchemaElement, formSchemaPointer: string, elementLevel: number): VNode => {
      // Create children of layout "elements"
      const createChildren = () => {
        return element.elements && element.elements.map((elem, index) => createComponent(elem, `${formSchemaPointer}/elements/${index}`, elementLevel + 1));
      };

      switch (element.type) {
        case 'Layout':
          return h(
            FseLayout,
            {
              props: {
                options: element.options,
                value: element,
                formSchemaPointer,
                level: elementLevel,
                name: element.options?.label?.replace('#lang/', ''),
                customTranslations: this.customTranslations,
                language: this.language
              },
              on: this.$listeners
            },
            createChildren()
          );
        case 'Control': {
          let partOfProps: { [key: string]: any } = {
            name: undefined,
            schema: {},
            formSchemaPointer,
            generalTranslation: {},
            customTranslations: {}
          };

          if (element.scope) {
            const elementName = element.scope.split('/').pop() as string;
            const elementSchema = JsonPointer.get(this.schema, element.scope) as any;

            partOfProps = {
              ...partOfProps,
              value: element,
              name: elementName,
              schema: elementSchema,
              generalTranslation: this.generalTranslation,
              customTranslations: this.customTranslations,
              language: this.language
            };
          }
          return h(FseControl, {
            props: {
              elements: element.elements,
              options: element.options,
              ...partOfProps,
              scope: element.scope || ''
            },
            on: this.$listeners
          });
        }
        case 'Label':
          return h(FseLabel, {
            props: {
              options: element.options,
              value: element,
              name: element.text.replace('#lang/', ''),
              text: element.text,
              formSchemaPointer,
              customTranslations: this.customTranslations,
              language: this.language
            },
            on: this.$listeners
          });
        case 'Widget':
          // eslint-disable-next-line no-case-declarations
          const widgetDefinition = WIDGETS.find((widget) => element.name === widget.code);
          if (!widgetDefinition) {
            // eslint-disable-next-line no-console
            console.warn(`VeoFseGenerator:: ${element.name} not found`);
            return null as any;
          }

          return h(VeoFseWidget, {
            props: {
              code: widgetDefinition.code,
              name: widgetDefinition.name,
              formSchemaPointer,
              description: widgetDefinition.description[this.$i18n.locale] || Object.values(widgetDefinition.description)[0]
            },
            on: this.$listeners
          });
      }
    };

    if (!this.value) {
      // If value (FormSchema) is not defined, "<!-- -->" will rendered
      // TODO: null causes problems with VNode type without "as any". Look for other solutions if possible
      return null as any;
    }

    return createComponent(this.value, '#', 0);
  }
});
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
