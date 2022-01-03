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
import { defineComponent, h, PropOptions } from '@nuxtjs/composition-api';
import { JSONSchema7 } from 'json-schema';
import { VCol } from 'vuetify/lib';

import { IVeoTranslationCollection } from '~/types/VeoTypes';
import { UISchemaElement } from '~/types/UISchema';
import * as InputText from '~/components/forms/Collection/FormElements/InputText.vue';
import * as InputNumber from '~/components/forms/Collection/FormElements/InputNumber.vue';
import * as InputTextMultiline from '~/components/forms/Collection/FormElements/InputTextMultiline.vue';
import * as Checkbox from '~/components/forms/Collection/FormElements/Checkbox.vue';
import * as Select from '~/components/forms/Collection/FormElements/Select.vue';
import * as Autocomplete from '~/components/forms/Collection/FormElements/Autocomplete.vue';
import * as ArrayField from '~/components/forms/Collection/FormElements/ArrayField.vue';
import * as InputDate from '~/components/forms/Collection/FormElements/InputDate.vue';
import * as Radio from '~/components/forms/Collection/FormElements/Radio.vue';
import * as Tags from '~/components/forms/Collection/FormElements/Tags.vue';
import * as MarkdownEditor from '~/components/forms/Collection/FormElements/MarkdownEditor.vue';
import * as InputUri from '~/components/forms/Collection/FormElements/InputUri.vue';
import * as InputDateTime from '~/components/forms/Collection/FormElements/InputDateTime.vue';
import * as LinksField from '~/components/forms/Collection/FormElements/LinksField.vue';

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

export default defineComponent({
  props: {
    value: {
      type: undefined,
      default: undefined
    },
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: undefined
    } as PropOptions<JSONSchema7>,
    options: {
      type: Object,
      default: undefined
    },
    validation: {
      type: Object,
      default: undefined
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
      default: undefined
    } as PropOptions<UISchemaElement[]>
  },
  setup(props, { listeners, emit }) {
    function appropriateComponent() {
      return components.sort((a: any, b: any) => b.helpers.matchingScore({ ...props }) - a.helpers.matchingScore({ ...props }))[0].default;
    }

    return () =>
      props.visible
        ? h(
            VCol,
            {
              props: {
                cols: 12,
                md: 'auto'
              },
              class: 'vf-control'
            },
            [
              h(appropriateComponent(), {
                props: { ...props },
                on: {
                  ...listeners,
                  input: (newValue: any): void => {
                    if (newValue === '') {
                      newValue = undefined;
                    }
                    emit('input', newValue);
                  }
                }
              })
            ]
          )
        : undefined;
  }
});
</script>

<style lang="scss" scoped>
::v-deep {
  .v-input--selection-controls {
    margin-top: 0 !important;
  }
  .vf-form-element .mdi-close {
    opacity: 0;
  }
  .vf-form-element:not(.vf-array-field):not(.vf-links-field):hover .mdi-close,
  .links-field-row-autocomplete:hover .mdi-close {
    opacity: 1;
  }

  .vf-form-element .mdi-close.primary--text,
  .vf-form-element .mdi-close.error--text {
    color: rgba(0, 0, 0, 0.54) !important;
    caret-color: rgba(0, 0, 0, 0.54) !important;
  }
}
</style>
