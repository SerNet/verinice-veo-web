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
<script lang="ts">
import Vue from 'vue';
import { PropOptions } from 'vue/types/options';
import { JSONSchema7 } from 'json-schema';
import { UISchemaElement } from '@/types/UISchema';

import * as InputText from './InputText.vue';
import * as InputNumber from './InputNumber.vue';
import * as InputTextMultiline from './InputTextMultiline.vue';
import * as Checkbox from './Checkbox.vue';
import * as Select from './Select.vue';
import * as Autocomplete from './Autocomplete.vue';
import * as ArrayField from './ArrayField.vue';
import * as InputDate from './InputDate.vue';
import * as Radio from './Radio.vue';
import * as Tags from './Tags.vue';
import * as MarkdownEditor from './MarkdownEditor.vue';
import * as InputUri from './InputUri.vue';
import * as InputDateTime from './InputDateTime.vue';
import * as LinksField from './LinksField.vue';
import { ContextListener } from '~/components/forms/Collection/utils/helpers';
import { IApi } from '~/components/forms/utils';
import { IVeoTranslationCollection } from '~/types/VeoTypes';

const components = [
  InputText,
  InputNumber,
  InputTextMultiline,
  Checkbox,
  Select,
  Autocomplete,
  ArrayField,
  InputDate,
  Radio,
  Tags,
  MarkdownEditor,
  InputUri,
  InputDateTime,
  LinksField
];

export default Vue.extend({
  name: 'FormElement',
  functional: true,
  props: {
    value: {
      type: undefined,
      default: () => undefined
    },
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: () => undefined
    } as PropOptions<JSONSchema7>,
    options: {
      type: Object,
      default: () => undefined
    },
    validation: {
      type: Object,
      default: () => undefined
    },
    disabled: Boolean,
    visible: Boolean,
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    elements: {
      type: Array,
      default: () => []
    } as PropOptions<UISchemaElement[]>,
    api: {
      type: Object,
      default: () => undefined
    } as PropOptions<IApi>
  },
  render(h, context) {
    const props = context.props;

    function appropriateComponent() {
      return components.sort((a: any, b: any) => b.helpers.matchingScore({ ...props }) - a.helpers.matchingScore({ ...props }))[0].default;
    }

    return h(
      appropriateComponent(),
      {
        props: { ...props },
        on: {
          input: (event: any): void => {
            // TODO: What is here really going on? Why do I need this and how can use it better? What does it really?
            // context.parent.$emit("input", $event); -> Alternative
            // TODO: Why does it have Call Stack problems if I don't use Following Commented Code
            // const emitInput = context.listeners.input
            // emitInput($event);

            // TODO: It Calls every event 2 times, but it must call it only once
            (context.listeners.input as ContextListener)(event);
          },
          change: (event: any): void => {
            (context.listeners.change as ContextListener)(event);
          }
        }
      },
      context.children
    );
  }
});
</script>

<style scoped></style>
