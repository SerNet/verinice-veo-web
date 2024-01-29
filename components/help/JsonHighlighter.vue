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
  <div class="json-highlighter">
    <pre class="language-json">
      <!-- eslint-disable vue/no-v-html -->
      <code
        class="language-json"
        v-html="textAsHighlighterHTML"
      />
    <!-- eslint-enable -->
    </pre>
  </div>
</template>

<script lang="ts">
import Prism from 'prismjs';
import 'prismjs/components/prism-json';

export default {
  props: {
    text: { type: String, default: '' },
  },
  computed: {
    textAsHighlighterHTML(): string {
      return this.text ?
          Prism.highlight(String(this.text || ''), Prism.languages.json, 'json')
        : '';
    },
  },
};
</script>

<style lang="scss">
// Good resource how to include external .css as inline in scss
// https://github.com/sass/node-sass/issues/2362#issuecomment-388634848
.json-highlighter {
  @import 'prismjs/themes/prism-okaidia';
  code::before,
  code::after {
    content: none;
  }
  code {
    padding: 1em;
    box-shadow: none;
  }
  pre {
    padding: 0;
    display: flex;
  }
}
</style>
