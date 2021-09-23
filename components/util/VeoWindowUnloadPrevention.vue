<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Jessica Lühnen
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
  <span />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    value: {
      handler(value) {
        if (!window) return;

        window.onbeforeunload = value ? () => this.$t('unsavedChanges') : null;
      },
      immediate: true
    }
  },
  beforeDestroy() {
    if (window) window.onbeforeunload = null;
  }
});
</script>

<i18n>
{
  "en": {
    "unsavedChanges": "There are unsaved changes. Do you really want to leave this page?"
  },
  "de": {
    "unsavedChanges": "Es gibt ungespeicherte Änderungen. Wollen Sie die Seite wirklich verlassen?"
  }
}
</i18n>
