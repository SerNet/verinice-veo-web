<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="display-1 font-weight-bold">Dokumentation</div>
      </v-col>
      <v-col v-for="(doc, i) in docs" :key="i">
        <v-list color="transparent">
          <v-subheader class="font-weight-black font-italic black--text">
            {{ doc.title }}
          </v-subheader>
          <v-list-item-group>
            <v-list-item v-for="(item, j) in doc.items" :key="j" :to="item.to" :ripple="true">
              <v-list-item-content>
                <v-list-item-title v-text="item.title" />
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import VeoForm from '~/components/forms/VeoForm.vue'

export default Vue.extend({
  name: 'Docs',
  data() {
    const HELP_ROOT = '/help/forms'
    return {
      docs: [
        {
          cols: '12',
          title: 'Controls:',
          items: [
            { to: HELP_ROOT + '/docs/controls/inputtext', title: 'Input Text' },
            { to: HELP_ROOT + '/docs/controls/inputnumber', title: 'Input Number' },
            { to: HELP_ROOT + '/docs/controls/inputDate', title: 'Input Date' },
            { to: HELP_ROOT + '/docs/controls/inputDateTime', title: 'Input Date-Time' },
            { to: HELP_ROOT + '/docs/controls/inputUri', title: 'Input URI' },
            {
              to: HELP_ROOT + '/docs/controls/inputTextMultiline',
              title: 'Input Text Multiline'
            },
            { to: HELP_ROOT + '/docs/controls/checkbox', title: 'Checkbox' },
            { to: HELP_ROOT + '/docs/controls/radio', title: 'Radio' },
            { to: HELP_ROOT + '/docs/controls/select', title: 'Select' },
            { to: HELP_ROOT + '/docs/controls/autocomplete', title: 'Autocomplete' },
            { to: HELP_ROOT + '/docs/controls/tags', title: 'Tags' },
            { to: HELP_ROOT + '/docs/controls/markdownEditor', title: 'Markdown Editor' },
            { to: HELP_ROOT + '/docs/controls/arrayField', title: 'Array Field' },
            { to: HELP_ROOT + '/docs/controls/linksField', title: 'Links Field' }
          ]
        },
        {
          cols: '4',
          title: 'Layouts:',
          items: [
            { to: HELP_ROOT + '/docs/layouts/group', title: 'Group' },
            { to: HELP_ROOT + '/docs/layouts/page', title: 'Page' }
          ]
        },
        {
          cols: '4',
          title: 'Static Texts:',
          items: [{ to: HELP_ROOT + '/docs/statictexts/label', title: 'Label' }]
        },
        {
          cols: '4',
          title: 'objectSchema Extras:',
          items: [{ to: HELP_ROOT + '/docs/objectSchemaExtras/default', title: 'Default' }]
        },
        {
          cols: '4',
          title: 'Rules:',
          items: [
            { to: HELP_ROOT + '/docs/rules/hide', title: 'Hide' },
            { to: HELP_ROOT + '/docs/rules/show', title: 'Show' },
            { to: HELP_ROOT + '/docs/rules/disable', title: 'Disable' },
            { to: HELP_ROOT + '/docs/rules/enable', title: 'Enable' }
          ]
        },
        {
          cols: '4',
          title: 'Options:',
          items: [
            { to: HELP_ROOT + '/docs/options/class', title: 'Class' },
            { to: HELP_ROOT + '/docs/options/style', title: 'Style' }
          ]
        }
      ]
    }
  }
})
</script>

<style lang="scss"></style>
