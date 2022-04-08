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
  <VeoPage
    fullsize
    title="Dokumentation"
  >
    <v-row>
      <v-col
        v-for="(doc, i) in docs"
        :key="i"
      >
        <v-list color="transparent">
          <v-subheader class="black--text font-weight-bold text-body-1">
            {{ doc.title }}
          </v-subheader>
          <v-list-item-group>
            <v-list-item
              v-for="(item, j) in doc.items"
              :key="j"
              :to="item.to"
              :ripple="true"
            >
              <v-list-item-content>
                <v-list-item-title v-text="item.title" />
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
    </v-row>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

export const ROUTE = '/help';

export default Vue.extend({
  name: 'Docs',
  layout: 'plain',
  data() {
    return {
      docs: [
        {
          cols: '12',
          title: 'Controls:',
          items: [
            { to: ROUTE + '/controls/inputText', title: 'Input Text' },
            { to: ROUTE + '/controls/inputNumber', title: 'Input Number' },
            { to: ROUTE + '/controls/inputDate', title: 'Input Date' },
            { to: ROUTE + '/controls/inputDateTime', title: 'Input Date-Time' },
            { to: ROUTE + '/controls/inputUri', title: 'Input URI' },
            {
              to: ROUTE + '/controls/inputTextMultiline',
              title: 'Input Text Multiline'
            },
            { to: ROUTE + '/controls/checkbox', title: 'Checkbox' },
            { to: ROUTE + '/controls/radio', title: 'Radio' },
            { to: ROUTE + '/controls/select', title: 'Select' },
            { to: ROUTE + '/controls/autocomplete', title: 'Autocomplete' },
            { to: ROUTE + '/controls/tags', title: 'Tags' },
            { to: ROUTE + '/controls/markdownEditor', title: 'Markdown Editor' },
            { to: ROUTE + '/controls/arrayField', title: 'Array Field' },
            { to: ROUTE + '/controls/linksField', title: 'Links Field' }
          ]
        },
        {
          cols: '4',
          title: 'Layouts:',
          items: [{ to: ROUTE + '/layouts/group', title: 'Group' }]
        },
        {
          cols: '4',
          title: 'Static Texts:',
          items: [{ to: ROUTE + '/statictexts/label', title: 'Label' }]
        },
        {
          cols: '4',
          title: 'objectSchema Extras:',
          items: [{ to: ROUTE + '/objectSchemaExtras/default', title: 'Default' }]
        },
        {
          cols: '4',
          title: 'Rules:',
          items: [
            { to: ROUTE + '/rules/hide', title: 'Hide' },
            { to: ROUTE + '/rules/show', title: 'Show' },
            { to: ROUTE + '/rules/disable', title: 'Disable' },
            { to: ROUTE + '/rules/enable', title: 'Enable' }
          ]
        },
        {
          cols: '4',
          title: 'Options:',
          items: [
            { to: ROUTE + '/options/class', title: 'Class' },
            { to: ROUTE + '/options/style', title: 'Style' }
          ]
        }
      ]
    };
  }
});
</script>
