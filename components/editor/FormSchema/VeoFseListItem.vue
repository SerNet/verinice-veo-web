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
  <VeoEditorListItem
    :title="title"
    :styling="styling"
    :translate="translate"
  />
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

import { IInputType } from '~/types/VeoEditor';

interface IProps {
  title: string;
  styling: IInputType;
  translate: boolean;
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String,
      default: undefined
    },
    styling: {
      type: Object,
      default: () => {}
    },
    translate: {
      type: Boolean,
      default: false
    }
  }
});
</script>
