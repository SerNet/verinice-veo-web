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
  <v-list-item class="veo-attribute-list-attribute my-2">
    <v-list-item-content class="d-block">
      <v-row>
        <v-col
          :cols="8"
          class="py-0"
        >
          <v-text-field
            :value="form.data.title"
            :label="`${t('aspectName')} *`"
            required
            :rules="form.rules.title"
            :prefix="prefix"
            @input="doUpdate($event, 'title')"
          />
        </v-col>
        <v-col
          :cols="4"
          class="py-0"
        >
          <v-select
            :value="form.data.type"
            :label="t('aspectType')"
            :items="types"
            @input="doUpdate($event, 'type')"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col class="py-0">
          <v-text-field
            :value="form.data.description"
            :label="t('aspectDescription')"
            clearable
            @input="doUpdate($event, 'description')"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="form.data.type === 'enum'"
        class="flex-column"
        dense
      >
        <v-col class="py-0 d-flex align-center">
          <h3 class="text-h3">
            {{ t('values') }}
          </h3>
          <v-checkbox
            v-model="form.data.multiple"
            dense
            hide-details
            :label="t('multiple')"
            class="mt-0 pt-0 ml-4"
            @change="doUpdate($event, 'multiple')"
          />
        </v-col>
        <v-col class="py-0">
          <v-combobox
            :value="form.data.enum"
            chips
            multiple
            disable-lookup
            hide-no-data
            append-icon=""
            clearable
            @input="doUpdate($event, 'enum')"
          >
            <template #label>
              <span>
                {{ t('valuesHint') }}
              </span>
            </template>
            <template #selection="data">
              <v-chip
                :key="JSON.stringify(data.item)"
                v-bind="data.attrs"
                close
                @click:close="removeValueFromEnum(data.item)"
              >
                {{ data.item }}
              </v-chip>
            </template>
          </v-combobox>
        </v-col>
      </v-row>
      <v-row
        v-if="formatOptions.length > 0"
        class="flex-column"
      >
        <v-col class="py-0">
          <v-select
            :value="currentFormatOption"
            :label="t('inputFormat')"
            :items="formatOptions"
            item-text="displayName"
            item-value="name"
            @input="updateOptions($event)"
          />
        </v-col>
      </v-row>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn
        fab
        depressed
        text
        color="black"
        @click="doDelete()"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, ComputedRef } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { cloneDeep, trim } from 'lodash';
import { IVeoOSHCustomProperty } from '~/lib/ObjectSchemaHelper2';
import { INPUT_TYPES } from '~/types/VeoEditor';

interface IProps extends IVeoOSHCustomProperty {
  aspectName: string;
  enum: any[];
}

interface IInputFormat {
  name: string;
  options: {
    [key: string]: string | undefined;
  };
}

interface IInputFormats {
  [key: string]: IInputFormat[];
}

const INPUT_FORMATS: IInputFormats = {
  string: [
    {
      name: 'text',
      options: {
        format: undefined,
        pattern: undefined
      }
    },
    {
      name: 'date',
      options: {
        format: 'date',
        pattern: undefined
      }
    },
    {
      name: 'dateTime',
      options: {
        format: 'date-time',
        pattern: undefined
      }
    },
    {
      name: 'uri',
      options: {
        format: 'uri',
        pattern: '^(https?|ftp)://'
      }
    }
  ]
};

export default defineComponent<IProps>({
  props: {
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'enum'
    },
    description: {
      type: String,
      default: ''
    },
    aspectName: {
      type: String,
      required: true
    },
    enum: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    format: {
      type: String,
      default: undefined
    },
    pattern: {
      type: String,
      default: undefined
    },
    originalId: {
      type: String,
      default: undefined
    }
  },
  setup(props, context) {
    const { t } = useI18n();
    const prefix = computed(() => props.aspectName + '_');

    watch(
      props,
      (newValue: any) => {
        form.value.data = { ...newValue };
        nextTick().then(() => {
          form.value.data.multiple = newValue.multiple;
        });
      },
      {
        deep: true
      }
    );

    const form = ref({
      data: {
        ...props
      },
      rules: {
        title: [(value: string) => trim(value).length > 0]
      }
    });

    nextTick().then(() => {
      form.value.data.multiple = props.multiple;
    });

    const types = computed(() => {
      const dummy: { text: string; value: string }[] = [];
      const availableTypes = INPUT_TYPES as any;
      for (const entry in availableTypes) {
        if (!['null', 'unknown', 'array', 'object'].includes(availableTypes[entry].name)) {
          dummy.push({
            text: t(`editor.inputtypes.${availableTypes[entry].name}`) as string,
            value: availableTypes[entry].name
          });
        }
      }
      return dummy;
    });

    function doDelete() {
      context.emit('delete');
    }

    function doObjectUpdate(newObject: any) {
      const object = { ...form.value.data, originalId: props.originalId } as any;

      // Delete properties only used for ui
      delete object.aspectName;

      // Iterate over every element in the new object. If set to undefined, delete the key, else set the value for the update.
      for (const key in newObject) {
        if (newObject[key] === undefined) {
          delete object[key];
        } else {
          object[key] = newObject[key];
        }
      }

      // If the object type changes, we have to delete all custom properties belonging to the previous type
      if (newObject.type && newObject.type !== form.value.data.type) {
        const newProperties = INPUT_FORMATS[newObject.type]?.find((item) => !item.options.format)?.options || {};
        const oldProperties = INPUT_FORMATS[form.value.data.type]?.find((item) => item.options.format === form.value.data.format)?.options || {};

        // Iterate over new
        for (const key in object) {
          if (oldProperties[key] && !newProperties[key]) {
            delete object[key];
          }
        }
      }
      context.emit('update', object);
    }

    function doUpdate(value: any, property: string) {
      doObjectUpdate({ [property]: value });
    }

    // special operations for enums
    const attributeTypes = ref([
      { text: 'Zahl', value: 'number' },
      { text: 'Ganzzahl', value: 'integer' },
      { text: 'Text', value: 'string' }
    ]);

    function removeValueFromEnum(value: string) {
      doUpdate(
        props.enum.filter((entry) => entry !== value),
        'enum'
      );
    }

    function updateOptions(formatType: string) {
      const object = cloneDeep(formatOptions.value.find((item) => item.name === formatType));
      if (object) {
        doObjectUpdate(object.options);
      }
    }

    // Special operations for all types
    const formatOptions: ComputedRef<IInputFormat[]> = computed(() => {
      return (INPUT_FORMATS[form.value.data.type] || []).map((entry: any) => {
        entry.displayName = t(`attributeTypes.${entry.name}`);
        return entry;
      });
    });

    const currentFormatOption: ComputedRef<string | undefined> = computed(() => {
      // We have to iterate over every object in the formatOptions array and only if the format property matches, we have the correct one.
      return formatOptions.value.find((item) => item.options.format === form.value.data.format)?.name;
    });

    return {
      prefix,
      form,
      types,
      doDelete,
      doUpdate,
      attributeTypes,
      formatOptions,
      removeValueFromEnum,
      updateOptions,
      currentFormatOption,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "multiple": "Multiple",
    "aspectDescription": "Description",
    "aspectName": "attribute name",
    "aspectType": "Attribute type",
    "inputFormat": "Input format",
    "values": "Available options",
    "valuesHint": "Available options (seperate entries with Enter)"
  },
  "de": {
    "multiple": "Mehrfachauswahl",
    "aspectDescription": "Beschreibung",
    "aspectName": "Name des Attributs",
    "aspectType": "Typ des Attributs",
    "inputFormat": "Eingabeformat",
    "values": "Auswahlmöglichkeiten",
    "valuesHint": "Werte (mit Enter trennen)"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-attribute-list-attribute {
  border: 1px solid $medium-grey;
  border-radius: 4px;
}
</style>
