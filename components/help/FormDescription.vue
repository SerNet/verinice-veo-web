<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize
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
  <v-row>
    <v-col
      cols="12"
      lg="4"
    >
      <div class="font-italic font-weight-black">
        objectSchema
      </div>
      <JsonHighlighter :text="objectSchemaStringified" />
    </v-col>
    <v-col
      cols="12"
      lg="4"
    >
      <div class="font-italic font-weight-black">
        formSchema
      </div>
      <JsonHighlighter :text="formSchemaStringified" />
    </v-col>
    <v-col
      cols="12"
      lg="4"
    >
      <div class="font-italic font-weight-black">
        data
      </div>
      <JsonHighlighter :text="dataStringified" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import JsonHighlighter from './JsonHighlighter.vue';

export default Vue.extend({
  name: 'FormDescription',
  components: {
    JsonHighlighter
  },
  props: {
    objectSchema: {
      type: Object,
      default: undefined
    },
    formSchema: {
      type: Object,
      default: undefined
    },
    data: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    objectSchemaStringified(): string {
      return this.stringify(this.objectSchema);
    },
    formSchemaStringified(): string {
      return this.stringify(this.formSchema);
    },
    dataStringified(): string {
      return this.stringify(this.data);
    }
  },
  methods: {
    stringify(json: JSON): string {
      return JSON.stringify(json, null, 4);
    }
  }
});
</script>
