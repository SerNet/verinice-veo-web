<template>
  <VeoPage>
    <VeoTabs>
      <template #tabs>
        <v-tab>
          Result
        </v-tab>
        <v-tab>
          Schema
        </v-tab>
        <v-tab>
          API Request Test
        </v-tab>
      </template>
      <template #items>
        <v-tab-item>
          <h2>Validated: {{ result.valid }}</h2>
          <v-list>
            <v-list-item v-for="(error, index) of result.errors" :key="index" link @click="copy(error.message)">
              <v-list-item-content>
                <v-list-item-title> Betroffene Property: {{ error.property }} </v-list-item-title>
                <v-list-item-subtitle> Fehler:<br />{{ error.message }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-tab-item>
        <v-tab-item>
          {{ schema }}
        </v-tab-item>
        <v-tab-item>
          <v-btn color="primary" @click="copy(JSON.stringify(test))">Copy</v-btn>
          {{ test }}
        </v-tab-item>
      </template>
    </VeoTabs>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import { validate } from 'json-schema'

import testSchema from '~/pages/test/fileToTest.json'

import testAspect from '~/pages/test/CustomAspectsMetaSchema.json'
import { getAspect } from '~/lib/ObjectSchemaHelper'

export default Vue.extend({
  data() {
    return {
      // schema: {}
      schema: testSchema,
      testAgainst: testAspect,
      test: {}
    }
  },
  head(): any {
    return {
      title: 'verinice.veo'
    }
  },
  computed: {
    result(): any {
      const aspect = getAspect(this.schema as any, 'AssetCommons')
      if (aspect && aspect.raw) {
        const result = validate(this.schema, this.schema as any)
        console.log(result)
        return result
      }

      return 'No schema provided'
    }
  },
  mounted() {
    this.$api.schema.fetch('process').then((data: any) => {
      this.test = data
      // this.schema = data
    })
  },
  methods: {
    copy(item: any) {
      navigator.clipboard.writeText(item).then(() => {
        alert('Copied to clipboard')
      })
    }
  }
})
</script>

<style lang="scss" scoped></style>
