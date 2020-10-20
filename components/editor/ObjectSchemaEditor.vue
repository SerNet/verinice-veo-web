<template>
  <v-col class="pa-0" cols="12">
    <v-row>
      <v-col class="pa-0" cols="12" lg="3">
        <v-subheader>Custom Aspects</v-subheader>
        <v-treeview shaped hoverable activatable :items="customAspects">
          <template #append="{item}">
            <v-chip v-for="(label, index) in item.labels" :key="index" :color="label.color" class="mr-2" small label outlined>{{ label.name }}</v-chip>
          </template>
        </v-treeview>
        <v-subheader>Custom Links</v-subheader>
        <v-treeview shaped hoverable activatable :items="customLinks">
          <template #append="{item}">
            <v-chip v-for="(label, index) in item.labels" :key="index" :color="label.color" class="mr-2" small label outlined>{{ label.name }}</v-chip>
          </template>
        </v-treeview>
      </v-col>
      <v-col cols="12" lg="9">DEF</v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { computed, reactive } from '@nuxtjs/composition-api'
import { JSONSchema7Object, JSONSchema7, JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema'
import schema from './object.schema.json'

interface ITypeInfo {
  name: string
  color: string
}

export default {
  setup() {
    const CUSTOM_ASPECTS_NAME = 'customAspects'
    const CUSTOM_ASPECT_ATTRIBUTES = 'attributes'
    const CUSTOM_LINKS_NAME = 'links'

    const state = reactive({
      schema: schema as JSONSchema7
    })

    const typeMap: Record<JSONSchema7TypeName | 'enum' | 'default', ITypeInfo> = {
      string: { name: 'string', color: 'red' },
      boolean: { name: 'boolean', color: 'teal' },
      object: { name: 'object', color: 'indigo' },
      number: { name: 'number', color: 'light-blue' },
      integer: { name: 'integer', color: 'green' },
      array: { name: 'array', color: 'amber' },
      enum: { name: 'enum', color: 'light-green' },
      null: { name: 'null', color: 'blue-grey' },
      default: { name: 'unknown', color: 'grey' }
    }

    function extractAttrbitues(treeName: string, nodeName: string = 'attributes', treeAttrs?: (node: JSONSchema7) => object, nodeAttrs?: (node: JSONSchema7) => object) {
      const customAspects = state.schema.properties?.[treeName] as JSONSchema7
      const aspects = customAspects?.properties || {}
      return Object.keys(aspects).map((k) => {
        const aspect = (aspects[k] as JSONSchema7) || {}
        const props = aspect?.properties || {}
        const attribs = (props?.[nodeName] as JSONSchema7) || {}
        const attribProps = attribs?.properties || {}
        return {
          id: k,
          name: k,
          ...treeAttrs?.(aspect),
          children: Object.keys(attribProps).map((attr) => {
            const attrib = attribProps[attr as keyof typeof attribProps] as JSONSchema7
            const type = attrib?.type || (attrib?.enum ? 'enum' : 'default')
            const typeName = typeof type === 'string' ? type : 'default'
            return {
              id: k + '/' + attr,
              name: attr,
              labels: [typeMap[typeName]],
              ...nodeAttrs?.(attrib)
            }
          })
        }
      })
    }

    const customAspects = computed(() =>
      extractAttrbitues(CUSTOM_ASPECTS_NAME, CUSTOM_ASPECT_ATTRIBUTES, (node: any) => ({
        labels: []
      }))
    )
    const customLinks = computed(() =>
      extractAttrbitues(CUSTOM_LINKS_NAME, CUSTOM_ASPECT_ATTRIBUTES, (node: any) => ({
        labels: [{ name: '→ ' + node?.items?.properties?.target?.properties?.type?.enum?.[0], color: 'black' }]
      }))
    )

    return { state, customAspects, customLinks }
  }
}
</script>

<style lang="scss" scoped></style>
