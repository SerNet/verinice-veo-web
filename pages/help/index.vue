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
  <VeoPage fullsize>
    <v-row>
      <v-col cols="12">
        <div class="display-1 font-weight-bold">
          Dokumentation
        </div>
      </v-col>
      <v-col
        v-for="(doc, i) in docs"
        :key="i"
      >
        <v-list color="transparent">
          <v-subheader class="font-weight-black font-italic black--text">
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

export default Vue.extend({
  name: 'Docs',
  data() {
    const HELP_ROOT = `/help`;
    return {
      docs: [
        {
          cols: '12',
          title: 'Controls:',
          items: [
            { to: HELP_ROOT + '/controls/inputText', title: 'Input Text' },
            { to: HELP_ROOT + '/controls/inputNumber', title: 'Input Number' },
            { to: HELP_ROOT + '/controls/inputDate', title: 'Input Date' },
            { to: HELP_ROOT + '/controls/inputDateTime', title: 'Input Date-Time' },
            { to: HELP_ROOT + '/controls/inputUri', title: 'Input URI' },
            {
              to: HELP_ROOT + '/controls/inputTextMultiline',
              title: 'Input Text Multiline'
            },
            { to: HELP_ROOT + '/controls/checkbox', title: 'Checkbox' },
            { to: HELP_ROOT + '/controls/radio', title: 'Radio' },
            { to: HELP_ROOT + '/controls/select', title: 'Select' },
            { to: HELP_ROOT + '/controls/autocomplete', title: 'Autocomplete' },
            { to: HELP_ROOT + '/controls/tags', title: 'Tags' },
            { to: HELP_ROOT + '/controls/markdownEditor', title: 'Markdown Editor' },
            { to: HELP_ROOT + '/controls/arrayField', title: 'Array Field' },
            { to: HELP_ROOT + '/controls/linksField', title: 'Links Field' }
          ]
        },
        {
          cols: '4',
          title: 'Layouts:',
          items: [{ to: HELP_ROOT + '/layouts/group', title: 'Group' }]
        },
        {
          cols: '4',
          title: 'Static Texts:',
          items: [{ to: HELP_ROOT + '/statictexts/label', title: 'Label' }]
        },
        {
          cols: '4',
          title: 'objectSchema Extras:',
          items: [{ to: HELP_ROOT + '/objectSchemaExtras/default', title: 'Default' }]
        },
        {
          cols: '4',
          title: 'Rules:',
          items: [
            { to: HELP_ROOT + '/rules/hide', title: 'Hide' },
            { to: HELP_ROOT + '/rules/show', title: 'Show' },
            { to: HELP_ROOT + '/rules/disable', title: 'Disable' },
            { to: HELP_ROOT + '/rules/enable', title: 'Enable' }
          ]
        },
        {
          cols: '4',
          title: 'Options:',
          items: [
            { to: HELP_ROOT + '/options/class', title: 'Class' },
            { to: HELP_ROOT + '/options/style', title: 'Style' }
          ]
        }
      ]
    };
  }
});
</script>

<style lang="scss"></style>
