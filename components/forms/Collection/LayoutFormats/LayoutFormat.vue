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
<script lang="ts">
import Vue from 'vue';

import * as Group from './Group.vue';

const components = [Group];

export default Vue.extend({
  name: 'LayoutFormat',
  functional: true,
  props: {
    options: {
      type: Object,
      default: undefined
    },
    formSchemaPointer: {
      type: String,
      default: undefined
    },
    disabled: Boolean,
    visible: Boolean
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
        on: {}
      },
      context.children
    );
  }
});
</script>

<style scoped></style>
