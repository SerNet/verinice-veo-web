<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
  <EditorListItem :title="title" :styling="styling" :translate="translate" lines="two">
    <template #description>
      <v-list-item-subtitle><span v-text="localizedDescription"></span></v-list-item-subtitle>
    </template>
  </EditorListItem>
</template>
<script lang="ts">
import type { PropType, Ref } from 'vue';

import type ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import type { IInputType } from '~/types/VeoEditor';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: undefined
    },
    prefix: {
      type: String,
      default: undefined
    },
    description: {
      type: String,
      default: undefined
    },
    twoLine: {
      type: Boolean
    },
    styling: {
      type: Object as PropType<IInputType>,
      default: () => ({})
    },
    translate: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const displayLanguage = inject<Ref<string> | undefined>('displayLanguage');
    const objectSchemaHelper = inject<Ref<ObjectSchemaHelper> | undefined>('objectSchemaHelper');

    /**
     * We sadly can't use a computed ref to get the localized description as vue won't
     * pick up changes in the translations array in the object schema helper.
     */
    const localizedDescription = ref(props.description);
    watch(
      () => objectSchemaHelper?.value,
      () => {
        i18n();
      },
      { deep: true }
    );

    watch(
      () => displayLanguage?.value,
      () => {
        i18n();
      }
    );

    function i18n() {
      if (objectSchemaHelper && displayLanguage) {
        const _localizedDescription = (objectSchemaHelper.value as ObjectSchemaHelper).getTranslation(
          displayLanguage.value as string,
          `${props.prefix}${props.title}`
        );

        localizedDescription.value = _localizedDescription || props.description || '';
      }
    }

    onMounted(() => {
      i18n();
    });

    return {
      localizedDescription
    };
  }
});
</script>
